package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMenuDto extends CreateMenuDto{
    @NotBlank(message = "{NOT_EMPTY}")
    private Integer id;
}
