package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateRoleDto {
    @NotBlank(message = "{NOT_EMPTY}")
    private Integer id;
    @NotBlank(message = "{NOT_EMPTY}")
    private String name;
    @NotEmpty(message = "{NOT_EMPTY}")
    private List<@NotNull Long> permissionIds;
    @NotEmpty(message = "{NOT_EMPTY}")
    private List<Long> menuIds;
}
