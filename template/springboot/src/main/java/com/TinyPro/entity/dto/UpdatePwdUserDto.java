package com.TinyPro.entity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class UpdatePwdUserDto {
    
    @NotEmpty(message = "{NOT_EMPTY}")
    @JsonProperty("email")
    private String email;

    @NotEmpty(message = "{NOT_EMPTY}")
    private String token;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String confirmNewPassword;

    @NotEmpty(message = "{NOT_EMPTY}")
    private String newPassword;

    @NotEmpty(message = "{NOT_EMPTY}")
    private String oldPassword;
}