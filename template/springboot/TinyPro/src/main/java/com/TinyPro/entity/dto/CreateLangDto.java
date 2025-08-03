package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CreateLangDto {

    @NotEmpty(message = "{validation.NOT_EMPTY}")
    private String name;
}