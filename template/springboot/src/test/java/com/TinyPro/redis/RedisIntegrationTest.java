package com.TinyPro.redis;

import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.TokenPair;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.service.TokenService;
import com.TinyPro.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class RedisIntegrationTest {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private RedisLockService redisLockService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void clearRedis() {
        try (RedisConnection connection = redisTemplate.getConnectionFactory().getConnection()) {
            connection.serverCommands().flushDb();
        }
    }

    @Test
    void consumesRefreshTokenAtomicallyAndMarksReplay() {
        String uid = "7";
        String refreshJti = "refresh-jti";
        String accessJti = "access-jti";
        String sessionId = "session-id";
        String refreshToken = "refresh-token";

        redisUtil.setValue(TokenRedisKeys.refresh(uid, refreshJti), refreshToken, 60);
        redisUtil.setValue(TokenRedisKeys.access(uid, accessJti), "access-token", 60);
        redisUtil.setValue(TokenRedisKeys.session(uid, sessionId), accessJti + "|" + refreshJti, 60);
        redisUtil.leftPush(TokenRedisKeys.sessions(uid), sessionId);
        redisUtil.leftPush(TokenRedisKeys.refreshIndex(uid), refreshJti);
        redisUtil.leftPush(TokenRedisKeys.accessIndex(uid), accessJti);

        assertEquals(1L, redisUtil.consumeRefreshToken(
                uid, refreshJti, refreshToken, accessJti, sessionId, 60_000L));
        assertNull(redisUtil.getValue(TokenRedisKeys.refresh(uid, refreshJti)));
        assertNull(redisUtil.getValue(TokenRedisKeys.access(uid, accessJti)));
        assertNull(redisUtil.getValue(TokenRedisKeys.session(uid, sessionId)));
        assertEquals(sessionId, redisUtil.getValue(TokenRedisKeys.usedRefresh(uid, refreshJti)));

        assertEquals(2L, redisUtil.consumeRefreshToken(
                uid, refreshJti, refreshToken, accessJti, sessionId, 60_000L));
    }

    @Test
    void rejectsRefreshReplayAndRevokesTheSession() {
        ReflectionTestUtils.setField(tokenService, "refreshRetryGraceMillis", 0L);
        TokenPair original = tokenService.issue(user(7, "redis-replay@example.com"));

        TokenPair rotated = tokenService.rotate(original.getRefreshToken());
        assertNotNull(rotated);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> tokenService.rotate(original.getRefreshToken())
        );

        assertEquals("exception.common.tokenReplay", exception.getErrorCode());
        assertEquals(401, exception.getHttpStatus().value());
    }

    @Test
    void returnsTheRotatedPairDuringTheRefreshGracePeriod() {
        ReflectionTestUtils.setField(tokenService, "refreshRetryGraceMillis", 5_000L);
        TokenPair original = tokenService.issue(user(8, "redis-grace@example.com"));

        TokenPair rotated = tokenService.rotate(original.getRefreshToken());
        TokenPair retry = tokenService.rotate(original.getRefreshToken());

        assertEquals(rotated, retry);
        assertTrue(redisTemplate.hasKey(TokenRedisKeys.refreshRotationResult(
                "8", jwtUtil.parseJwt(original.getRefreshToken()).getId())));
    }

    @Test
    void supportsNestedReentrantLocksWithRealRedis() {
        String result = redisLockService.execute("nested-test", () ->
                redisLockService.execute("nested-test", () -> "ok"));

        assertEquals("ok", result);
        assertFalse(Boolean.TRUE.equals(redisTemplate.hasKey("lock:nested-test")));
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
