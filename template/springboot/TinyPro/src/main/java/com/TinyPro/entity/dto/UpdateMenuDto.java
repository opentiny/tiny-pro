package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMenuDto extends CreateMenuDto{
    @NotBlank(message = "{validation.NOT_EMPTY}")
    private Integer id;
}
