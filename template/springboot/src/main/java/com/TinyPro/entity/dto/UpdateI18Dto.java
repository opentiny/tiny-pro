package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateI18Dto {
    @NotNull(message = "{NOT_EMPTY}")
    private Integer lang;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String key;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String content;
}
