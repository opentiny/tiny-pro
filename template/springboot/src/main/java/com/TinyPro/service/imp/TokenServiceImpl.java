package com.TinyPro.service.imp;

import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.vo.AuthenticatedPrincipal;
import com.TinyPro.entity.vo.TokenPair;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.redis.RedisLockService;
import com.TinyPro.redis.TokenRedisKeys;
import com.TinyPro.service.TokenService;
import com.TinyPro.utils.JwtUtil;
import com.alibaba.fastjson.JSON;
import io.jsonwebtoken.Claims;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.function.Supplier;
import java.util.regex.Pattern;

@Service
public class TokenServiceImpl implements TokenService {

    private static final Logger logger = LoggerFactory.getLogger(TokenServiceImpl.class);

    private static final Pattern API_TOKEN_NAME_PATTERN =
            Pattern.compile("^(?!ids$)[A-Za-z0-9][A-Za-z0-9_-]{0,63}$");

    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final IUserRepository userRepository;
    private final RedisLockService redisLockService;

    @Value("${auth.access-token-ttl-seconds:7200}")
    private long accessTokenTtlSeconds;

    @Value("${auth.refresh-token-ttl-millis:604800000}")
    private long refreshTokenTtlMillis;

    @Value("${auth.api-token-ttl-seconds:604800}")
    private long apiTokenTtlSeconds;

    @Value("${auth.device-limit:-1}")
    private long deviceLimit;

    public TokenServiceImpl(
            JwtUtil jwtUtil,
            RedisUtil redisUtil,
            IUserRepository userRepository,
            RedisLockService redisLockService) {
        this.jwtUtil = jwtUtil;
        this.redisUtil = redisUtil;
        this.userRepository = userRepository;
        this.redisLockService = redisLockService;
    }

    public TokenPair issue(User user) {
        return issue(user.getId(), user.getEmail(), sessionUserJson(user), UUID.randomUUID().toString());
    }

    public ApiToken issueApiToken(User user, String tokenName) {
        if (apiTokenTtlSeconds <= 0) {
            throw new IllegalStateException("API token TTL must be positive");
        }
        if (tokenName != null && !tokenName.isBlank()
                && !API_TOKEN_NAME_PATTERN.matcher(tokenName).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "tokenName must use letters, numbers, '-' or '_' and cannot be 'ids'");
        }

        String tokenId = StringUtils.defaultIfBlank(tokenName,
                "api_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().replace("-", ""));
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("type", "api");
        claims.put("tokenId", tokenId);
        String token = jwtUtil.generateToken(claims, tokenId, apiTokenTtlSeconds * 1000L);
        redisUtil.setApiToken(user.getEmail(), tokenId, token, apiTokenTtlSeconds);
        return new ApiToken(token, tokenId, apiTokenTtlSeconds);
    }

    @Override
    public AuthenticatedPrincipal authenticate(String token) {
        Claims claims = parseAuthenticationToken(token);
        String email = claims.get("email", String.class);
        if (StringUtils.isBlank(email)) {
            throw tokenError();
        }

        if ("api".equals(claims.get("type", String.class))) {
            String tokenId = claims.get("tokenId", String.class);
            if (!validateApiToken(email, tokenId, token)) {
                throw expiredError();
            }
            return new AuthenticatedPrincipal(
                    email,
                    null,
                    AuthenticatedPrincipal.TokenType.API
            );
        }

        if (claims.get("id") != null && claims.getId() != null) {
            if (!isAccessTokenActive(token)) {
                throw expiredError();
            }
            return new AuthenticatedPrincipal(
                    email,
                    userId(claims),
                    AuthenticatedPrincipal.TokenType.ACCESS
            );
        }

        return authenticateLegacy(email);
    }

    public boolean isApiTokenActive(String token, Claims claims) {
        if (!"api".equals(claims.get("type", String.class))) {
            return false;
        }
        String email = claims.get("email", String.class);
        String tokenId = claims.get("tokenId", String.class);
        return StringUtils.isNotBlank(email)
                && validateApiToken(email, tokenId, token);
    }

    private AuthenticatedPrincipal authenticateLegacy(String email) {
        String cached = redisUtil.getValue(TokenRedisKeys.legacyToken(email));
        if (StringUtils.isBlank(cached)) {
            throw tokenError();
        }

        try {
            User user = JSON.parseObject(cached, User.class);
            if (user == null || !email.equals(user.getEmail())) {
                throw tokenError();
            }
            return new AuthenticatedPrincipal(
                    email,
                    user.getId(),
                    AuthenticatedPrincipal.TokenType.LEGACY
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw tokenError();
        }
    }

    public boolean validateApiToken(String email, String token) {
        return StringUtils.isNotBlank(email)
                && StringUtils.isNotBlank(token)
                && redisUtil.getAllApiTokens(email).contains(token);
    }

    @Override
    public boolean validateApiToken(String email, String tokenId, String token) {
        return StringUtils.isNotBlank(email)
                && StringUtils.isNotBlank(token)
                && redisUtil.containsApiToken(email, tokenId, token);
    }

    public void revokeApiToken(String email, String tokenId) {
        redisUtil.deleteApiToken(email, tokenId);
    }

    public TokenPair issue(int userId, String email, String userJson, String sessionId) {
        return withUserLock(userId, () -> issueWithoutLock(userId, email, userJson, sessionId));
    }

    private TokenPair issueWithoutLock(int userId, String email, String userJson, String sessionId) {
        long accessTtlMillis = accessTokenTtlSeconds * 1000L;
        validateTtl(accessTtlMillis, refreshTokenTtlMillis);
        enforceDeviceLimit(String.valueOf(userId));

        String accessJti = UUID.randomUUID().toString();
        String refreshJti = UUID.randomUUID().toString();
        String issueAt = Instant.now().toString();

        Map<String, Object> accessClaims = new HashMap<>();
        accessClaims.put("jti", accessJti);
        accessClaims.put("id", userId);
        accessClaims.put("email", email);
        accessClaims.put("issueAt", issueAt);
        accessClaims.put("ttl", accessTtlMillis);
        accessClaims.put("refreshTokenJti", refreshJti);
        accessClaims.put("sid", sessionId);
        accessClaims.put("typ", "access");

        Map<String, Object> refreshClaims = new HashMap<>();
        refreshClaims.put("jti", refreshJti);
        refreshClaims.put("id", userId);
        refreshClaims.put("email", email);
        refreshClaims.put("issueAt", issueAt);
        refreshClaims.put("ttl", refreshTokenTtlMillis);
        refreshClaims.put("accessTokenJti", accessJti);
        refreshClaims.put("sid", sessionId);
        refreshClaims.put("typ", "refresh");

        String accessToken = jwtUtil.generateToken(accessClaims, accessJti, accessTtlMillis);
        String refreshToken = jwtUtil.generateToken(refreshClaims, refreshJti, refreshTokenTtlMillis);

        String uid = String.valueOf(userId);
        String accessKey = TokenRedisKeys.access(uid, accessJti);
        String refreshKey = TokenRedisKeys.refresh(uid, refreshJti);
        String sessionKey = TokenRedisKeys.session(uid, sessionId);
        String sessionValue = accessJti + "|" + refreshJti;

        assertLeaseHeld();
        redisUtil.setValueMillis(accessKey, accessToken, accessTtlMillis);
        assertLeaseHeld();
        redisUtil.setValueMillis(refreshKey, refreshToken, refreshTokenTtlMillis);
        assertLeaseHeld();
        redisUtil.setValueMillis(sessionKey, sessionValue, refreshTokenTtlMillis);
        assertLeaseHeld();
        redisUtil.leftPush(TokenRedisKeys.sessions(uid), sessionId);
        assertLeaseHeld();
        redisUtil.leftPush(TokenRedisKeys.accessIndex(uid), accessJti);
        assertLeaseHeld();
        redisUtil.leftPush(TokenRedisKeys.refreshIndex(uid), refreshJti);
        expireSessionIndexes(uid);
        if (StringUtils.isNotBlank(userJson)) {
            assertLeaseHeld();
            redisUtil.setValue(
                    TokenRedisKeys.legacyToken(email),
                    userJson,
                    accessTokenTtlSeconds
            );
        }

        return new TokenPair(accessToken, refreshToken, accessTtlMillis, refreshTokenTtlMillis);
    }

    private void enforceDeviceLimit(String uid) {
        cleanupExpiredIndexes(uid);

        if (deviceLimit <= 0) {
            return;
        }

        String refreshListKey = TokenRedisKeys.refreshIndex(uid);
        List<String> refreshJtis = new ArrayList<>(safeRange(refreshListKey));

        while (refreshJtis.size() >= deviceLimit) {
            String oldestRefreshJti = refreshJtis.get(refreshJtis.size() - 1);
            assertLeaseHeld();
            String oldestRefreshToken = redisUtil.getValue(TokenRedisKeys.refresh(uid, oldestRefreshJti));
            if (StringUtils.isBlank(oldestRefreshToken)) {
                redisUtil.removeList(refreshListKey, oldestRefreshJti);
                refreshJtis.remove(refreshJtis.size() - 1);
                continue;
            }

            try {
                Claims claims = jwtUtil.parseJwt(oldestRefreshToken);
                String accessJti = requiredClaim(claims, "accessTokenJti");
                String sessionId = StringUtils.defaultIfBlank(claims.get("sid", String.class), accessJti);
                revokePair(uid, accessJti, oldestRefreshJti, sessionId);
            } catch (RuntimeException ex) {
                // An invalid/expired Redis token must not prevent a new login.
                redisUtil.deleteValue(TokenRedisKeys.refresh(uid, oldestRefreshJti));
                redisUtil.removeList(refreshListKey, oldestRefreshJti);
            }
            refreshJtis.remove(refreshJtis.size() - 1);
        }
    }

    /**
     * Redis expires token values, but list members do not inherit the value
     * TTL. Remove stale index entries on every login, including when there is
     * no device limit.
     */
    private void cleanupExpiredIndexes(String uid) {
        String accessListKey = TokenRedisKeys.accessIndex(uid);
        for (String accessJti : safeRange(accessListKey)) {
            if (StringUtils.isBlank(redisUtil.getValue(TokenRedisKeys.access(uid, accessJti)))) {
                redisUtil.removeList(accessListKey, accessJti);
            }
        }

        String refreshListKey = TokenRedisKeys.refreshIndex(uid);
        for (String refreshJti : safeRange(refreshListKey)) {
            if (StringUtils.isBlank(redisUtil.getValue(TokenRedisKeys.refresh(uid, refreshJti)))) {
                redisUtil.removeList(refreshListKey, refreshJti);
            }
        }

        String sessionListKey = TokenRedisKeys.sessions(uid);
        for (String sessionId : safeRange(sessionListKey)) {
            if (StringUtils.isBlank(redisUtil.getValue(TokenRedisKeys.session(uid, sessionId)))) {
                redisUtil.removeList(sessionListKey, sessionId);
            }
        }
    }

    /**
     * List indexes have no per-member TTL. Give each index a TTL no shorter
     * than the refresh-token lifetime so abandoned indexes cannot live forever.
     */
    private void expireSessionIndexes(String uid) {
        assertLeaseHeld();
        redisUtil.expireMillis(TokenRedisKeys.sessions(uid), refreshTokenTtlMillis);
        assertLeaseHeld();
        redisUtil.expireMillis(TokenRedisKeys.accessIndex(uid), refreshTokenTtlMillis);
        assertLeaseHeld();
        redisUtil.expireMillis(TokenRedisKeys.refreshIndex(uid), refreshTokenTtlMillis);
    }

    private List<String> safeRange(String key) {
        List<String> values = redisUtil.range(key, 0, -1);
        return values == null ? List.of() : values;
    }

    public TokenPair rotate(String presentedRefreshToken) {
        Claims initialClaims = parseToken(presentedRefreshToken);
        return withUserLock(userId(initialClaims), () -> rotateWithoutLock(presentedRefreshToken));
    }

    private TokenPair rotateWithoutLock(String presentedRefreshToken) {
        Claims claims = parseToken(presentedRefreshToken);
        String type = claims.get("typ", String.class);
        if (type != null && !"refresh".equals(type)) {
            throw tokenError();
        }
        String refreshJti = requiredClaim(claims, "jti");
        String accessJti = requiredClaim(claims, "accessTokenJti");
        if (claims.get("refreshTokenJti") != null) {
            throw tokenError();
        }

        int userId = userId(claims);
        String email = requiredClaim(claims, "email");
        String sessionId = StringUtils.defaultIfBlank(claims.get("sid", String.class), accessJti);
        String uid = String.valueOf(userId);
        String sessionValue = redisUtil.getValue(TokenRedisKeys.session(uid, sessionId));

        if (!matchesSession(sessionValue, accessJti, refreshJti)) {
            if (sessionId.equals(redisUtil.getValue(TokenRedisKeys.usedRefresh(uid, refreshJti)))) {
                revokeSession(uid, sessionId);
                throw replayError();
            }
            throw expiredError();
        }

        String userJson = redisUtil.getValue(TokenRedisKeys.legacyToken(email));
        if (StringUtils.isBlank(userJson)) {
            User user = userRepository.findByEmail(email).orElseThrow(() ->
                    new BusinessException("exception.auth.userNotExists", HttpStatus.NOT_FOUND, null));
            userJson = sessionUserJson(user);
        }
        Long consumed = redisUtil.consumeRefreshToken(
                uid,
                refreshJti,
                presentedRefreshToken,
                accessJti,
                sessionId,
                refreshTokenTtlMillis
        );
        assertLeaseHeld();

        if (consumed != null && consumed == 2L) {
            revokeSession(uid, sessionId);
            throw replayError();
        }
        if (consumed == null || consumed != 1L) {
            throw expiredError();
        }

        return issue(userId, email, userJson, sessionId);
    }

    public boolean isAccessTokenActive(String accessToken) {
        Claims claims = parseToken(accessToken);
        String type = claims.get("typ", String.class);
        if ((type != null && !"access".equals(type))
                || claims.get("refreshTokenJti") == null) {
            return false;
        }

        int userId = userId(claims);
        String accessJti = requiredClaim(claims, "jti");
        String refreshJti = requiredClaim(claims, "refreshTokenJti");
        String sessionId = StringUtils.defaultIfBlank(claims.get("sid", String.class), accessJti);
        String uid = String.valueOf(userId);
        try {
        String storedToken = redisUtil.getValue(TokenRedisKeys.access(uid, accessJti));
        String sessionValue = redisUtil.getValue(TokenRedisKeys.session(uid, sessionId));
            if (!accessToken.equals(storedToken)) {
                return false;
            }
            if (sessionContainsAccess(sessionValue, accessJti)) {
                return true;
            }
            return StringUtils.isNotBlank(redisUtil.getValue(TokenRedisKeys.refresh(uid, refreshJti)));
        } catch (RuntimeException ex) {
            logger.warn("Redis error while validating access token", ex);
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "认证服务暂时不可用，请稍后重试",
                    ex
            );
        }
    }

    public void logout(String accessToken) {
        Claims initialClaims = parseToken(accessToken);
        withUserLock(userId(initialClaims), () -> {
            logoutWithoutLock(accessToken);
            return null;
        });
    }

    private void logoutWithoutLock(String accessToken) {
        Claims claims = parseToken(accessToken);
        String type = claims.get("typ", String.class);
        if ((type != null && !"access".equals(type))
                || claims.get("refreshTokenJti") == null) {
            throw tokenError();
        }
        String uid = String.valueOf(userId(claims));
        String accessJti = requiredClaim(claims, "jti");
        String refreshJti = requiredClaim(claims, "refreshTokenJti");
        String sessionId = StringUtils.defaultIfBlank(claims.get("sid", String.class), accessJti);
        revokePair(uid, accessJti, refreshJti, sessionId);
    }

    public void revokeUserSessions(String email) {
        if (StringUtils.isBlank(email)) {
            return;
        }
        String legacyKey = TokenRedisKeys.legacyToken(email);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getId() == null) {
            redisUtil.deleteValue(legacyKey);
            redisUtil.deleteAllApiTokens(email);
            return;
        }

        revokeUserSessions(email, user.getId());
    }

    @Override
    public void revokeUserSessions(String email, Integer userId) {
        if (StringUtils.isBlank(email) || userId == null) {
            return;
        }
        withUserLock(userId, () -> {
            revokeUserSessionsWithoutLock(email, userId);
            return null;
        });
    }

    private void revokeUserSessionsWithoutLock(String email, Integer userId) {
        String legacyKey = TokenRedisKeys.legacyToken(email);
        String uid = String.valueOf(userId);
        for (String sessionId : redisUtil.range(TokenRedisKeys.sessions(uid), 0, -1)) {
            assertLeaseHeld();
            revokeSession(uid, sessionId);
        }
        for (String accessJti : redisUtil.range(TokenRedisKeys.accessIndex(uid), 0, -1)) {
            assertLeaseHeld();
            redisUtil.deleteValue(TokenRedisKeys.access(uid, accessJti));
        }
        for (String refreshJti : redisUtil.range(TokenRedisKeys.refreshIndex(uid), 0, -1)) {
            assertLeaseHeld();
            redisUtil.deleteValue(TokenRedisKeys.refresh(uid, refreshJti));
        }
        assertLeaseHeld();
        redisUtil.deleteValue(TokenRedisKeys.sessions(uid));
        assertLeaseHeld();
        redisUtil.deleteValue(TokenRedisKeys.accessIndex(uid));
        assertLeaseHeld();
        redisUtil.deleteValue(TokenRedisKeys.refreshIndex(uid));
        assertLeaseHeld();
        redisUtil.deleteValue(legacyKey);
        assertLeaseHeld();
        redisUtil.deleteAllApiTokens(email);
    }

    public void revokeSession(String uid, String sessionId) {
        String sessionKey = TokenRedisKeys.session(uid, sessionId);
        String sessionValue = redisUtil.getValue(sessionKey);
        if (StringUtils.isBlank(sessionValue)) {
            assertLeaseHeld();
            redisUtil.removeList(TokenRedisKeys.sessions(uid), sessionId);
            return;
        }

        String[] parts = sessionValue.split("\\|", -1);
        if (parts.length == 2) {
            revokePair(uid, parts[0], parts[1], sessionId);
            return;
        }
        redisUtil.deleteValue(sessionKey);
    }

    private void revokePair(String uid, String accessJti, String refreshJti, String sessionId) {
        assertLeaseHeld();
        redisUtil.deleteValue(TokenRedisKeys.access(uid, accessJti));
        assertLeaseHeld();
        redisUtil.deleteValue(TokenRedisKeys.refresh(uid, refreshJti));
        assertLeaseHeld();
        redisUtil.removeList(TokenRedisKeys.accessIndex(uid), accessJti);
        assertLeaseHeld();
        redisUtil.removeList(TokenRedisKeys.refreshIndex(uid), refreshJti);
        assertLeaseHeld();
        redisUtil.removeList(TokenRedisKeys.sessions(uid), sessionId);
        assertLeaseHeld();
        redisUtil.deleteValue(TokenRedisKeys.session(uid, sessionId));
    }

    private Claims parseToken(String token) {
        if (StringUtils.isBlank(token)) {
            throw tokenError();
        }
        try {
            Claims claims = jwtUtil.parseJwt(token);
            if (claims.get("id") == null) {
                throw tokenError();
            }
            return claims;
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw expiredError();
        }
    }

    private Claims parseAuthenticationToken(String token) {
        if (StringUtils.isBlank(token)) {
            throw tokenError();
        }
        try {
            return jwtUtil.parseJwt(token);
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw tokenError();
        }
    }

    private int userId(Claims claims) {
        Object value = claims.get("id");
        if (!(value instanceof Number)) {
            throw tokenError();
        }
        return ((Number) value).intValue();
    }

    private String requiredClaim(Claims claims, String name) {
        String value = claims.get(name, String.class);
        if (StringUtils.isBlank(value)) {
            throw tokenError();
        }
        return value;
    }

    private boolean matchesSession(String sessionValue, String accessJti, String refreshJti) {
        return (accessJti + "|" + refreshJti).equals(sessionValue);
    }

    private boolean sessionContainsAccess(String sessionValue, String accessJti) {
        return sessionValue != null && sessionValue.startsWith(accessJti + "|");
    }

    private BusinessException tokenError() {
        return new BusinessException("exception.common.tokenError", HttpStatus.UNAUTHORIZED, null);
    }

    private BusinessException expiredError() {
        return new BusinessException("exception.common.tokenExpire", HttpStatus.UNAUTHORIZED, null);
    }

    private BusinessException replayError() {
        return new BusinessException("exception.common.tokenReplay", HttpStatus.UNAUTHORIZED, null);
    }

    private <T> T withUserLock(int userId, Supplier<T> action) {
        return redisLockService.execute(TokenRedisKeys.userLock(String.valueOf(userId)), action);
    }

    private void assertLeaseHeld() {
        redisLockService.assertLeaseHeld();
    }

    private void validateTtl(long accessTtlMillis, long refreshTtlMillis) {
        if (accessTtlMillis <= 0 || refreshTtlMillis <= 0 || accessTtlMillis >= refreshTtlMillis) {
            throw new IllegalStateException("Access token TTL must be positive and shorter than refresh token TTL");
        }
    }

    private String sessionUserJson(User user) {
        Map<String, Object> sessionUser = new HashMap<>();
        sessionUser.put("id", user.getId());
        sessionUser.put("email", user.getEmail());
        return JSON.toJSONString(sessionUser);
    }
}
