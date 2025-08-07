package com.TinyPro.entity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class UpdatePwdAdminDto {

    @NotEmpty(message = "{validation.NOT_EMPTY}")
    @JsonProperty("email")
    private String email;

    @NotEmpty(message = "{validation.NOT_EMPTY}")
    @JsonProperty("newPassword")
    private String newPassword;
    @JsonProperty("confirmNewPassword")
    private String confirmNewPassword; // 可选字段
}