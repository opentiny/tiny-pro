package com.TinyPro.redis;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedisUtilTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Test
    void detectsInstallationFlag() {
        when(redisTemplate.hasKey("FLAG:INSTALL")).thenReturn(true, false);

        RedisUtil redisUtil = newRedisUtil();

        assertTrue(redisUtil.exists("FLAG:INSTALL"));
        assertFalse(redisUtil.exists("FLAG:INSTALL"));
    }

    @Test
    void persistsInstallationFlagWithoutTtl() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        RedisUtil redisUtil = newRedisUtil();
        redisUtil.setPersistentValue("FLAG:INSTALL", "1");

        verify(valueOperations).set("FLAG:INSTALL", "1");
    }

    private RedisUtil newRedisUtil() {
        RedisUtil redisUtil = new RedisUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(
                redisUtil,
                "redisTemplate",
                redisTemplate
        );
        return redisUtil;
    }
}
