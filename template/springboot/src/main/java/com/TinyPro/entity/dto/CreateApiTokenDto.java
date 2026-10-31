package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * API Token creation request.
 */
@Data
public class CreateApiTokenDto {

    @NotEmpty(message = "{NOT_EMPTY}")
    @Email
    private String email;

    @NotEmpty(message = "{NOT_EMPTY}")
    private String password;

    /** Optional token name. A random ID is generated when omitted. */
    @Pattern(
            regexp = "^(?!ids$)[A-Za-z0-9][A-Za-z0-9_-]{0,63}$",
            message = "tokenName must use letters, numbers, '-' or '_' and cannot be 'ids'"
    )
    private String tokenName;
}
