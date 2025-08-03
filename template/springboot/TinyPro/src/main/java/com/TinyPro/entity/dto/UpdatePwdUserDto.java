package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class UpdatePwdUserDto {
    
    @NotEmpty(message = "{validation.email.notEmpty}")

    private String email;

    @NotEmpty(message = "{validation.token.notEmpty}")
    private String token;

    @NotEmpty(message = "{validation.newPassword.notEmpty}")
    @Length(min = 6, message = "{validation.newPassword.length}")
    private String newPassword;

    @NotEmpty(message = "{validation.oldPassword.notEmpty}")
    private String oldPassword;
}