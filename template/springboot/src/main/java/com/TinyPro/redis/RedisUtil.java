package com.TinyPro.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisUtil {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

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

    /**
     * 获取 Redis 中的值
     *
     * @param key Redis 键
     * @return Redis 值
     */
    public String getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 删除 Redis 中的值
     *
     * @param key Redis 键
     */
    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }
}