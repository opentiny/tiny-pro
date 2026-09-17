package com.TinyPro.redis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Redis based distributed reentrant lock.
 *
 * <p>The lock owner is unique to this application instance and thread. A
 * lock is acquired with SET NX PX, re-entry and release are checked by Lua,
 * and execute() renews the lease while the protected action is running.</p>
 */
@Service
public class RedisLockService {

    private static final Logger logger = LoggerFactory.getLogger(RedisLockService.class);
    private static final String KEY_PREFIX = "lock:";
    private static final long DEFAULT_WAIT_MILLIS = 10_000L;
    private static final long DEFAULT_LEASE_MILLIS = 30_000L;

    private static final RedisScript<Long> REENTER_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                redis.call('PEXPIRE', KEYS[1], ARGV[2])
                return 1
            end
            return 0
            """, Long.class);

    private static final RedisScript<Long> RELEASE_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
            end
            return 0
            """, Long.class);

    private static final RedisScript<Long> RENEW_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('PEXPIRE', KEYS[1], ARGV[2])
            end
            return 0
            """, Long.class);

    private final String instanceId = UUID.randomUUID().toString();
    private final ThreadLocal<Map<String, Integer>> holdCounts =
            ThreadLocal.withInitial(HashMap::new);
    private final ScheduledExecutorService renewExecutor = Executors.newScheduledThreadPool(
            1,
            new DaemonThreadFactory()
    );

    @Autowired
    private StringRedisTemplate redisTemplate;

    public boolean tryLock(String key) {
        return tryLock(key, DEFAULT_WAIT_MILLIS, DEFAULT_LEASE_MILLIS);
    }

    public boolean tryLock(String key, long waitMillis, long leaseMillis) {
        validateArguments(key, waitMillis, leaseMillis);

        String redisKey = lockKey(key);
        String owner = ownerId();
        long deadline = System.currentTimeMillis() + Math.max(waitMillis, 0L);

        while (true) {
            if (tryAcquire(redisKey, owner, leaseMillis)) {
                holdCounts.get().merge(redisKey, 1, Integer::sum);
                return true;
            }

            if (waitMillis <= 0) {
                return false;
            }

            long remaining = deadline - System.currentTimeMillis();
            if (remaining <= 0) {
                return false;
            }
            sleep(Math.min(100L, remaining));
        }
    }

    public boolean unlock(String key) {
        String redisKey = lockKey(key);
        Map<String, Integer> counts = holdCounts.get();
        Integer count = counts.get(redisKey);
        if (count == null || count <= 0) {
            return false;
        }

        if (count > 1) {
            counts.put(redisKey, count - 1);
            return true;
        }

        Long released = redisTemplate.execute(
                RELEASE_SCRIPT,
                List.of(redisKey),
                ownerId()
        );
        counts.remove(redisKey);
        if (counts.isEmpty()) {
            holdCounts.remove();
        }
        return Long.valueOf(1L).equals(released);
    }

    public boolean renew(String key, long leaseMillis) {
        validateArguments(key, 0L, leaseMillis);
        String redisKey = lockKey(key);
        if (!holdCounts.get().containsKey(redisKey)) {
            return false;
        }
        return renew(redisKey, ownerId(), leaseMillis);
    }

    private boolean renew(String redisKey, String owner, long leaseMillis) {
        Long renewed = redisTemplate.execute(
                RENEW_SCRIPT,
                List.of(redisKey),
                owner,
                String.valueOf(leaseMillis)
        );
        return Long.valueOf(1L).equals(renewed);
    }

    public <T> T execute(String key, Supplier<T> action) {
        return execute(key, DEFAULT_WAIT_MILLIS, DEFAULT_LEASE_MILLIS, action);
    }

    public <T> T execute(String key, long waitMillis, long leaseMillis, Supplier<T> action) {
        if (!tryLock(key, waitMillis, leaseMillis)) {
            throw new IllegalStateException("Failed to acquire Redis lock: " + key);
        }

        String owner = ownerId();
        long renewInterval = Math.max(leaseMillis / 3L, 100L);
        ScheduledFuture<?> renewal = renewExecutor.scheduleAtFixedRate(
                () -> {
                    if (!renew(lockKey(key), owner, leaseMillis)) {
                        logger.warn("Redis lock lease renewal failed: {}", key);
                    }
                },
                renewInterval,
                renewInterval,
                TimeUnit.MILLISECONDS
        );

        try {
            return action.get();
        } finally {
            renewal.cancel(false);
            if (!unlock(key)) {
                logger.warn("Redis lock release failed or lock expired: {}", key);
            }
        }
    }

    private boolean tryAcquire(String redisKey, String owner, long leaseMillis) {
        String currentOwner = redisTemplate.opsForValue().get(redisKey);
        if (owner.equals(currentOwner)) {
            Long reentered = redisTemplate.execute(
                    REENTER_SCRIPT,
                    List.of(redisKey),
                    owner,
                    String.valueOf(leaseMillis)
            );
            return Long.valueOf(1L).equals(reentered);
        }

        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(
                redisKey,
                owner,
                leaseMillis,
                TimeUnit.MILLISECONDS
        );
        return Boolean.TRUE.equals(acquired);
    }

    private String lockKey(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Redis lock key must not be blank");
        }
        return KEY_PREFIX + key;
    }

    private String ownerId() {
        return instanceId + ":thread-" + Thread.currentThread().getId();
    }

    private void validateArguments(String key, long waitMillis, long leaseMillis) {
        lockKey(key);
        if (waitMillis < 0 || leaseMillis <= 0) {
            throw new IllegalArgumentException("Invalid Redis lock timeout");
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while waiting for Redis lock", ex);
        }
    }

    private static class DaemonThreadFactory implements ThreadFactory {
        @Override
        public Thread newThread(Runnable runnable) {
            Thread thread = new Thread(runnable, "redis-lock-renewal");
            thread.setDaemon(true);
            return thread;
        }
    }
}
