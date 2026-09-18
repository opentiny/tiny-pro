package com.TinyPro.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
public class RedisUtil {

    private static final RedisScript<Long> CONSUME_REFRESH_TOKEN_SCRIPT = new DefaultRedisScript<>("""
            local current = redis.call('GET', KEYS[1])
            if current == ARGV[1] then
                redis.call('DEL', KEYS[1], KEYS[2], KEYS[4])
                redis.call('LREM', KEYS[5], 0, ARGV[4])
                redis.call('LREM', KEYS[6], 0, ARGV[2])
                redis.call('LREM', KEYS[7], 0, ARGV[3])
                redis.call('SET', KEYS[3], ARGV[4], 'PX', ARGV[5])
                return 1
            end

            if redis.call('GET', KEYS[3]) == ARGV[4] then
                return 2
            end
            return 0
            """, Long.class);

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * 设置 Redis 中的值，并设置过期时间
     *
     * @param key     Redis 键
     * @param value   Redis 值
     * @param timeout 过期时间（秒）
     */
    public void setValue(String key, String value, long timeout) {
        redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.SECONDS);
    }

    public void setValueMillis(String key, String value, long timeoutMillis) {
        redisTemplate.opsForValue().set(key, value, timeoutMillis, TimeUnit.MILLISECONDS);
    }

    /**
     * 获取 Redis 中的值
     *
     * @param key Redis 键
     * @return Redis 值
     */
    public String getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public boolean exists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Stores a value without a TTL. Used for installation state that must
     * survive application restarts until it is explicitly removed.
     */
    public void setPersistentValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * 删除 Redis 中的值
     *
     * @param key Redis 键
     */
    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }

    public void leftPush(String key, String value) {
        redisTemplate.opsForList().leftPush(key, value);
    }

    public List<String> range(String key, long start, long end) {
        List<String> values = redisTemplate.opsForList().range(key, start, end);
        return values == null ? List.of() : values;
    }

    public void removeList(String key, String value) {
        redisTemplate.opsForList().remove(key, 0, value);
    }

    public void setApiToken(String email, String tokenId, String token, long ttlSeconds) {
        setValue(apiTokenKey(email, tokenId), token, ttlSeconds);
    }

    public String getApiToken(String email, String tokenId) {
        return getValue(apiTokenKey(email, tokenId));
    }

    public List<String> getAllApiTokens(String email) {
        Set<String> keys = redisTemplate.keys("user:" + email + ":api:*");
        if (keys == null || keys.isEmpty()) {
            return List.of();
        }
        List<String> values = redisTemplate.opsForValue().multiGet(keys);
        return values == null ? List.of() : values.stream().filter(java.util.Objects::nonNull).toList();
    }

    public void deleteApiToken(String email, String tokenId) {
        deleteValue(apiTokenKey(email, tokenId));
    }

    /**
     * NestJS currently does not include tokenId in the API JWT payload, so
     * validation falls back to matching the token under the user's API keys.
     */
    public boolean containsApiToken(String email, String tokenId, String token) {
        if (tokenId != null && !tokenId.isBlank()) {
            return token.equals(getApiToken(email, tokenId));
        }

        return getAllApiTokens(email).contains(token);
    }

    private String apiTokenKey(String email, String tokenId) {
        return "user:" + email + ":api:" + tokenId;
    }

    /**
     * Atomically consumes a refresh token. Return values: 1 consumed, 2 replay,
     * 0 missing or mismatched token.
     */
    public Long consumeRefreshToken(
            String uid,
            String refreshJti,
            String refreshToken,
            String accessJti,
            String sessionId,
            long replayTtlMillis
    ) {
        String refreshKey = "rt:" + uid + ":" + refreshJti;
        String accessKey = "at:" + uid + ":" + accessJti;
        String usedKey = "used:rt:" + uid + ":" + refreshJti;
        String sessionKey = "session:" + uid + ":" + sessionId;
        String sessionListKey = "user:" + uid + ":sessions";
        String refreshListKey = "user:" + uid + ":rt";
        String accessListKey = "user:" + uid + ":at";

        return redisTemplate.execute(
                CONSUME_REFRESH_TOKEN_SCRIPT,
                Arrays.asList(
                        refreshKey,
                        accessKey,
                        usedKey,
                        sessionKey,
                        sessionListKey,
                        refreshListKey,
                        accessListKey
                ),
                refreshToken,
                refreshJti,
                accessJti,
                sessionId,
                String.valueOf(replayTtlMillis)
        );
    }
}
