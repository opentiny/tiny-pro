package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NonNull;

@Data
public class CreateAuthDto {
    @NotNull(message = "{NOT_EMPTY}")
    private String email;
    @NotNull(message = "{NOT_EMPTY}")
    private String password;
}
