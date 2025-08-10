package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class UpdatePermissionDto extends CreatePermissionDto{
    @NotEmpty(message = "{NOT_EMPTY}")
    private Integer id;
}
