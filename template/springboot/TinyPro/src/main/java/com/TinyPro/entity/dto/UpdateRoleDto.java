package com.TinyPro.entity.dto;

import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
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
    @NotNull(message = "{NOT_NULL}")
    private List<@NotNull Long> permissionIds;
    @NotNull(message = "{NOT_NULL}")
    private List<Menu> menus;
    @NotNull(message = "{NOT_NULL}")
    private List<Long> menuIds;
    @NotNull(message = "{NOT_NULL}")
    private List<Permission> permission;
}
