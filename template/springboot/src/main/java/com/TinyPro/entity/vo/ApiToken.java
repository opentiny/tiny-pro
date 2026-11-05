package com.TinyPro.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiToken {
    private String token;
    private String tokenId;
    private long expiresIn;
}
