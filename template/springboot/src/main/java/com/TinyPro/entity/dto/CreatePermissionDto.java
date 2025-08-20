package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CreatePermissionDto {
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String name;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String desc;
}