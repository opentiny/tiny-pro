package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMenuDto {
    @NotNull(message = "{validation.NOT_EMPTY}")
    private Integer order;
    
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String menuType;
    
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String name;
    
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String path;
    
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String component;
    
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String icon;
    
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String locale;
    
    private Integer parentId; // 可为null
}