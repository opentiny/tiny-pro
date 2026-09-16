package com.TinyPro.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Token response compatible with the NestJS backend.
 * TTL values are expressed in milliseconds.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenPair {
    private String accessToken;
    private String refreshToken;
    private long accessTokenTTL;
    private long refreshTokenTTL;
}
