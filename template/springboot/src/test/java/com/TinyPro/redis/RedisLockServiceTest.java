package com.TinyPro.redis;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedisLockServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RedisLockService lockService;

    @AfterEach
    void tearDown() {
        if (lockService != null) {
            lockService.shutdown();
        }
    }

    @Test
    void renewsTheOriginalLockKeyFromTheScheduledThread() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("lock:session")).thenReturn(null);
        when(valueOperations.setIfAbsent(eq("lock:session"), anyString(), eq(300L), eq(TimeUnit.MILLISECONDS)))
                .thenReturn(true);
        doReturn(1L).when(redisTemplate).execute(
                any(RedisScript.class), anyList(), any(Object[].class)
        );

        lockService = new RedisLockService();
        ReflectionTestUtils.setField(lockService, "redisTemplate", redisTemplate);

        CountDownLatch actionStarted = new CountDownLatch(1);
        CountDownLatch releaseAction = new CountDownLatch(1);
        Thread worker = new Thread(() -> lockService.execute("session", 0L, 300L, () -> {
            actionStarted.countDown();
            try {
                releaseAction.await(2, TimeUnit.SECONDS);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
            return null;
        }));
        worker.start();

        assertTrue(actionStarted.await(1, TimeUnit.SECONDS));
        Thread.sleep(150L);
        releaseAction.countDown();
        worker.join(1_000L);

        ArgumentCaptor<List<String>> keys = ArgumentCaptor.forClass(List.class);
        verify(redisTemplate, timeout(1_000L).atLeastOnce())
                .execute(any(RedisScript.class), keys.capture(), any(Object[].class));
        assertTrue(keys.getAllValues().stream().allMatch(List.of("lock:session")::equals));
        assertFalse(worker.isAlive());
    }
}
