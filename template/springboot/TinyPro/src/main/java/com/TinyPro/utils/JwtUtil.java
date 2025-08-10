package com.TinyPro.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
@Component
public class JwtUtil {

    private final Key secretKey;

    @Value("${jwt.secret}")
    private String secretString;

    public JwtUtil(@Value("${jwt.secret}") String secretString) {
        try {
            // 使用 SHA-256 哈希算法将字符串转换为字节数组
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secretString.getBytes());

            // 将字节数组转换为 SecretKey
            this.secretKey = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate secret key", e);
        }
    }

    /**
     * 生成 JWT
     *
     * @param email      用户的邮箱地址
     * @param expiration JWT 的过期时间（毫秒）
     * @return 生成的 JWT
     */
    public  String generateJwt(String email, long expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email); // 将 email 作为声明

        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email) // 使用 email 作为主题
                .setIssuedAt(now)
                .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 解析 JWT
     *
     * @param jwt JWT 字符串
     * @return 解析后的 JWT 声明
     * @throws SignatureException 如果 JWT 签名无效
     */
    public Claims parseJwt(String jwt) throws SignatureException {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .setAllowedClockSkewSeconds(60) // 允许 60 秒误差
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();
        } catch (ExpiredJwtException e) {
            // 可以再次捕获，自定义提示
            throw new IllegalArgumentException("Token 已过期", e);
        } catch (SignatureException e) {
            throw new SignatureException("Invalid JWT signature");
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }
    /**
     * 传入旧 JWT，把过期时间整体 +2 分钟，返回新的 JWT
     *
     * @param oldJwt  原来的 token
     * @return        延长 2 分钟后的新 token
     */
    public String extendExpiration(String oldJwt) {
        Claims claims = parseJwt(oldJwt);          // 先解析（会校验签名/过期）
        Date  newExp  = new Date(System.currentTimeMillis() + 120_000); // +2 分钟

        return Jwts.builder()
                .setClaims(claims)           // 保留原 payload
                .setSubject(claims.getSubject())
                .setIssuedAt(new Date())     // 可更新签发时间
                .setExpiration(newExp)       // 新的过期时间
                .signWith(secretKey)         // 用同一 key 重新签名
                .compact();
    }
}