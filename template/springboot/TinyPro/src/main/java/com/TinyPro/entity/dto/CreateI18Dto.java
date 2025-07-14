package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateI18Dto {
    @NotNull(message = "{NOT_EMPTY}")
    private Integer lang;
    @NotNull(message = "{NOT_EMPTY}")
    private String key;
    @NotNull(message = "{NOT_EMPTY}")
    private String content;
}
