package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
@Data
public class CreateRoleDto {
    @NotBlank
    private String name;

    @NotNull(message = "{NOT_NULL}")
    private List<@NotNull Long> permissionIds;

    @NotNull(message = "{NOT_NULL}")
    private List<@NotNull Long> menuIds;
}
