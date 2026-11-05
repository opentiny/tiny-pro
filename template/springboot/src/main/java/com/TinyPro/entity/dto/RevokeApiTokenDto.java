package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RevokeApiTokenDto {

    @NotEmpty(message = "{NOT_EMPTY}")
    @Email
    private String email;

    @NotEmpty(message = "{NOT_EMPTY}")
    private String tokenId;
}
