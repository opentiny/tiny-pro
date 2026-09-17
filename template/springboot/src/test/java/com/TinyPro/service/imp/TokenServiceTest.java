package com.TinyPro.service.imp;

import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.vo.TokenPair;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.TokenService;
import com.TinyPro.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private RedisUtil redisUtil;

    @Mock
    private IUserRepository userRepository;

    private TokenService tokenService;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("token-service-test-secret");
        tokenService = new TokenServiceImpl(jwtUtil, redisUtil, userRepository);
        ReflectionTestUtils.setField(tokenService, "accessTokenTtlSeconds", 7200L);
        ReflectionTestUtils.setField(tokenService, "refreshTokenTtlMillis", 604800000L);
    }

    @Test
    void issueReturnsNestCompatibleTokenPair() {
        User user = user(7, "user@example.com");

        TokenPair pair = tokenService.issue(user);

        assertNotNull(pair.getAccessToken());
        assertNotNull(pair.getRefreshToken());
        assertEquals(7200000L, pair.getAccessTokenTTL());
        assertEquals(604800000L, pair.getRefreshTokenTTL());

        Claims accessClaims = jwtUtil.parseJwt(pair.getAccessToken());
        Claims refreshClaims = jwtUtil.parseJwt(pair.getRefreshToken());
        assertEquals("access", accessClaims.get("typ"));
        assertEquals("refresh", refreshClaims.get("typ"));
        assertEquals(7, ((Number) accessClaims.get("id")).intValue());
        assertEquals(accessClaims.getId(), refreshClaims.get("accessTokenJti"));
        assertEquals(refreshClaims.getId(), accessClaims.get("refreshTokenJti"));
    }

    @Test
    void rotateConsumesRefreshTokenAndReturnsNewPair() {
        User user = user(7, "user@example.com");
        TokenPair original = tokenService.issue(user);
        Claims refreshClaims = jwtUtil.parseJwt(original.getRefreshToken());
        Claims accessClaims = jwtUtil.parseJwt(original.getAccessToken());
        String uid = "7";
        String sessionId = accessClaims.get("sid", String.class);
        String sessionValue = accessClaims.getId() + "|" + refreshClaims.getId();

        when(redisUtil.getValue("session:" + uid + ":" + sessionId)).thenReturn(sessionValue);
        when(redisUtil.getValue("user:user@example.com:token"))
                .thenReturn("{\"id\":7,\"email\":\"user@example.com\"}");
        when(redisUtil.consumeRefreshToken(
                eq(uid), eq(refreshClaims.getId()), eq(original.getRefreshToken()),
                eq(accessClaims.getId()), eq(sessionId), anyLong()))
                .thenReturn(1L);

        TokenPair rotated = tokenService.rotate(original.getRefreshToken());

        assertNotEquals(original.getAccessToken(), rotated.getAccessToken());
        assertNotEquals(original.getRefreshToken(), rotated.getRefreshToken());
    }

    @Test
    void rotateRejectsReplay() {
        User user = user(7, "user@example.com");
        TokenPair original = tokenService.issue(user);
        Claims refreshClaims = jwtUtil.parseJwt(original.getRefreshToken());
        Claims accessClaims = jwtUtil.parseJwt(original.getAccessToken());
        String sessionId = accessClaims.get("sid", String.class);
        String sessionValue = accessClaims.getId() + "|" + refreshClaims.getId();

        when(redisUtil.getValue("session:7:" + sessionId)).thenReturn(sessionValue);
        when(redisUtil.getValue("user:user@example.com:token"))
                .thenReturn("{\"id\":7,\"email\":\"user@example.com\"}");
        when(redisUtil.consumeRefreshToken(anyString(), anyString(), anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(2L);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> tokenService.rotate(original.getRefreshToken())
        );

        assertEquals(401, exception.getHttpStatus().value());
    }

    @Test
    void expiredOrRevokedAccessTokenIsInactive() {
        User user = user(7, "user@example.com");
        TokenPair pair = tokenService.issue(user);

        when(redisUtil.getValue(anyString())).thenReturn(null);

        assertFalse(tokenService.isAccessTokenActive(pair.getAccessToken()));
    }

    @Test
    void issueApiTokenUsesNestCompatibleResponseAndPayload() {
        User user = user(7, "user@example.com");
        ReflectionTestUtils.setField(tokenService, "apiTokenTtlSeconds", 604800L);

        ApiToken apiToken = tokenService.issueApiToken(user, "integration");

        assertEquals("integration", apiToken.getTokenId());
        assertEquals(604800L, apiToken.getExpiresIn());
        Claims claims = jwtUtil.parseJwt(apiToken.getToken());
        assertEquals("api", claims.get("type"));
        assertEquals("user@example.com", claims.get("email"));
        assertEquals("integration", claims.get("tokenId"));
        verify(redisUtil).setApiToken("user@example.com", "integration", apiToken.getToken(), 604800L);
    }

    @Test
    void apiTokenIsValidatedAgainstRedisAndCanBeRevoked() {
        when(redisUtil.getAllApiTokens("user@example.com"))
                .thenReturn(java.util.List.of("api-token"));

        assertTrue(tokenService.validateApiToken("user@example.com", "api-token"));
        tokenService.revokeApiToken("user@example.com", "integration");

        verify(redisUtil).deleteApiToken("user@example.com", "integration");
    }

    @Test
    void issueEvictsOldestSessionWhenDeviceLimitIsReached() {
        User user = user(7, "user@example.com");
        ReflectionTestUtils.setField(tokenService, "deviceLimit", 1L);

        String oldAccessJti = "old-access";
        String oldRefreshJti = "old-refresh";
        String oldSessionId = "old-session";
        Map<String, Object> oldRefreshClaims = new java.util.HashMap<>();
        oldRefreshClaims.put("id", 7);
        oldRefreshClaims.put("email", "user@example.com");
        oldRefreshClaims.put("jti", oldRefreshJti);
        oldRefreshClaims.put("accessTokenJti", oldAccessJti);
        oldRefreshClaims.put("sid", oldSessionId);
        String oldRefreshToken = jwtUtil.generateToken(oldRefreshClaims, oldRefreshJti, 604800000L);

        when(redisUtil.range("user:7:rt", 0, -1))
                .thenReturn(java.util.List.of(oldRefreshJti));
        when(redisUtil.getValue("rt:7:" + oldRefreshJti)).thenReturn(oldRefreshToken);

        tokenService.issue(user);

        verify(redisUtil).deleteValue("at:7:" + oldAccessJti);
        verify(redisUtil).deleteValue("rt:7:" + oldRefreshJti);
        verify(redisUtil).removeList("user:7:rt", oldRefreshJti);
    }

    private User user(int id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setSalt("salt");
        user.setPassword("password");
        return user;
    }
}
