package com.TinyPro.service.imp;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.vo.TokenPair;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.redis.RedisLockService;
import com.TinyPro.service.TokenService;
import com.TinyPro.utils.JwtUtil;
import com.alibaba.fastjson.JSON;
import io.jsonwebtoken.Claims;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Supplier;

@Service
public class TokenServiceImpl implements TokenService {

    private static final String ACCESS_PREFIX = "at:";
    private static final String REFRESH_PREFIX = "rt:";
    private static final String SESSION_PREFIX = "session:";
    private static final String USED_REFRESH_PREFIX = "used:rt:";
    private static final String SESSION_LIST_SUFFIX = ":sessions";

    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final IUserRepository userRepository;

    @Autowired
    private RedisLockService redisLockService;

    @Value("${auth.access-token-ttl-seconds:7200}")
    private long accessTokenTtlSeconds;

    @Value("${auth.refresh-token-ttl-millis:604800000}")
    private long refreshTokenTtlMillis;

    @Value("${auth.api-token-ttl-seconds:604800}")
    private long apiTokenTtlSeconds;

    @Value("${auth.device-limit:-1}")
    private long deviceLimit;

    public TokenServiceImpl(JwtUtil jwtUtil, RedisUtil redisUtil, IUserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.redisUtil = redisUtil;
        this.userRepository = userRepository;
    }

    public TokenPair issue(User user) {
        return issue(user.getId(), user.getEmail(), sessionUserJson(user), UUID.randomUUID().toString());
    }

    public ApiToken issueApiToken(User user, String tokenName) {
        if (apiTokenTtlSeconds <= 0) {
            throw new IllegalStateException("API token TTL must be positive");
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

    public boolean isApiTokenActive(String token, Claims claims) {
        if (!"api".equals(claims.get("type", String.class))) {
            return false;
        }
        String email = claims.get("email", String.class);
        String tokenId = claims.get("tokenId", String.class);
        return StringUtils.isNotBlank(email)
                && validateApiToken(email, token);
    }

    /**
     * Equivalent to NestJS AuthService.validateApiToken(email, token).
     */
    public boolean validateApiToken(String email, String token) {
        return StringUtils.isNotBlank(email)
                && StringUtils.isNotBlank(token)
                && redisUtil.getAllApiTokens(email).contains(token);
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
        String accessKey = accessKey(uid, accessJti);
        String refreshKey = refreshKey(uid, refreshJti);
        String sessionKey = sessionKey(uid, sessionId);
        String sessionValue = accessJti + "|" + refreshJti;

        redisUtil.setValueMillis(accessKey, accessToken, accessTtlMillis);
        redisUtil.setValueMillis(refreshKey, refreshToken, refreshTokenTtlMillis);
        redisUtil.setValueMillis(sessionKey, sessionValue, refreshTokenTtlMillis);
        redisUtil.leftPush(sessionListKey(uid), sessionId);
        redisUtil.leftPush("user:" + uid + ":at", accessJti);
        redisUtil.leftPush("user:" + uid + ":rt", refreshJti);
        if (StringUtils.isNotBlank(userJson)) {
            redisUtil.setValue(
                    Contants.UserJwtTop + email + Contants.UserJwtbt,
                    userJson,
                    accessTokenTtlSeconds
            );
        }

        return new TokenPair(accessToken, refreshToken, accessTtlMillis, refreshTokenTtlMillis);
    }

    private void enforceDeviceLimit(String uid) {
        if (deviceLimit <= 0) {
            return;
        }

        String refreshListKey = "user:" + uid + ":rt";
        List<String> refreshJtis = new ArrayList<>(safeRange(refreshListKey));

        // Redis TTL removes the token value first; remove stale JTI list entries.
        for (String refreshJti : new ArrayList<>(refreshJtis)) {
            if (StringUtils.isBlank(redisUtil.getValue(refreshKey(uid, refreshJti)))) {
                redisUtil.removeList(refreshListKey, refreshJti);
                refreshJtis.remove(refreshJti);
            }
        }

        while (refreshJtis.size() >= deviceLimit) {
            String oldestRefreshJti = refreshJtis.get(refreshJtis.size() - 1);
            String oldestRefreshToken = redisUtil.getValue(refreshKey(uid, oldestRefreshJti));
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
                redisUtil.deleteValue(refreshKey(uid, oldestRefreshJti));
                redisUtil.removeList(refreshListKey, oldestRefreshJti);
            }
            refreshJtis.remove(refreshJtis.size() - 1);
        }
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
        String sessionValue = redisUtil.getValue(sessionKey(uid, sessionId));
        if (StringUtils.isBlank(sessionValue)) {
            String storedRefreshToken = redisUtil.getValue(refreshKey(uid, refreshJti));
            if (presentedRefreshToken.equals(storedRefreshToken)) {
                // Allows rotation of NestJS sessions, which do not have our session key.
                sessionValue = accessJti + "|" + refreshJti;
            }
        }

        if (!matchesSession(sessionValue, accessJti, refreshJti)) {
            if (sessionId.equals(redisUtil.getValue(usedRefreshKey(uid, refreshJti)))) {
                revokeSession(uid, sessionId);
                throw replayError();
            }
            throw expiredError();
        }

        String userJson = redisUtil.getValue(Contants.UserJwtTop + email + Contants.UserJwtbt);
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
        try {
            Claims claims = parseToken(accessToken);
            String type = claims.get("typ", String.class);
            if ((type != null && !"access".equals(type))
                    || claims.get("refreshTokenJti") == null) {
                return false;
            }
            int userId = userId(claims);
            String accessJti = requiredClaim(claims, "jti");
            String sessionId = StringUtils.defaultIfBlank(claims.get("sid", String.class), accessJti);
            String storedToken = redisUtil.getValue(accessKey(String.valueOf(userId), accessJti));
            String sessionValue = redisUtil.getValue(sessionKey(String.valueOf(userId), sessionId));
            if (!accessToken.equals(storedToken)) {
                return false;
            }
            if (sessionContainsAccess(sessionValue, accessJti)) {
                return true;
            }
            String refreshJti = requiredClaim(claims, "refreshTokenJti");
            return StringUtils.isNotBlank(redisUtil.getValue(refreshKey(String.valueOf(userId), refreshJti)));
        } catch (RuntimeException ex) {
            return false;
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
        String legacyKey = Contants.UserJwtTop + email + Contants.UserJwtbt;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getId() == null) {
            redisUtil.deleteValue(legacyKey);
            return;
        }

        withUserLock(user.getId(), () -> {
            revokeUserSessionsWithoutLock(email, user);
            return null;
        });
    }

    private void revokeUserSessionsWithoutLock(String email, User user) {
        String legacyKey = Contants.UserJwtTop + email + Contants.UserJwtbt;
        String uid = String.valueOf(user.getId());
        for (String sessionId : redisUtil.range(sessionListKey(uid), 0, -1)) {
            revokeSession(uid, sessionId);
        }
        for (String accessJti : redisUtil.range("user:" + uid + ":at", 0, -1)) {
            redisUtil.deleteValue(accessKey(uid, accessJti));
        }
        for (String refreshJti : redisUtil.range("user:" + uid + ":rt", 0, -1)) {
            redisUtil.deleteValue(refreshKey(uid, refreshJti));
        }
        redisUtil.deleteValue(sessionListKey(uid));
        redisUtil.deleteValue("user:" + uid + ":at");
        redisUtil.deleteValue("user:" + uid + ":rt");
        redisUtil.deleteValue(legacyKey);
    }

    public void revokeSession(String uid, String sessionId) {
        String sessionKey = sessionKey(uid, sessionId);
        String sessionValue = redisUtil.getValue(sessionKey);
        if (StringUtils.isBlank(sessionValue)) {
            redisUtil.removeList(sessionListKey(uid), sessionId);
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
        redisUtil.deleteValue(accessKey(uid, accessJti));
        redisUtil.deleteValue(refreshKey(uid, refreshJti));
        redisUtil.removeList("user:" + uid + ":at", accessJti);
        redisUtil.removeList("user:" + uid + ":rt", refreshJti);
        redisUtil.removeList(sessionListKey(uid), sessionId);
        redisUtil.deleteValue(sessionKey(uid, sessionId));
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

    private String accessKey(String uid, String jti) {
        return ACCESS_PREFIX + uid + ":" + jti;
    }

    private String refreshKey(String uid, String jti) {
        return REFRESH_PREFIX + uid + ":" + jti;
    }

    private String sessionKey(String uid, String sessionId) {
        return SESSION_PREFIX + uid + ":" + sessionId;
    }

    private String sessionListKey(String uid) {
        return Contants.UserJwtTop + uid + SESSION_LIST_SUFFIX;
    }

    private String usedRefreshKey(String uid, String jti) {
        return USED_REFRESH_PREFIX + uid + ":" + jti;
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
        if (redisLockService == null) {
            return action.get();
        }
        return redisLockService.execute("user-token:" + userId, action);
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
