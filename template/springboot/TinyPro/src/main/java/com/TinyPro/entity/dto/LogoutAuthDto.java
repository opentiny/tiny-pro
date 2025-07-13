package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class LogoutAuthDto {
    @NotEmpty(message = "NOT_EMPTY_HUMAN")
    private String token;
}
