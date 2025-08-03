package com.TinyPro.entity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class UpdatePwdAdminDto {

    @NotEmpty(message = "{validation.email.notEmpty}")
    @JsonProperty("email")
    private String email;

    @NotEmpty(message = "{validation.newPassword.notEmpty}")
    @Length(min = 6, message = "{validation.newPassword.length}")
    @JsonProperty("newPassword")
    private String newPassword;
    @JsonProperty("confirmNewPassword")
    private String confirmNewPassword; // 可选字段
}