package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * API Token creation request, compatible with the NestJS backend.
 */
@Data
public class CreateApiTokenDto {

    @NotEmpty(message = "{NOT_EMPTY}")
    @Email
    private String email;

    @NotEmpty(message = "{NOT_EMPTY}")
    private String password;

    /** Optional token name. A random ID is generated when omitted. */
    private String tokenName;
}
