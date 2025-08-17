package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateI18Dto {
    private Integer lang;
    private String key;
    private String content;
}
