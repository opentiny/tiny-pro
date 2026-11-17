package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EditorDocumentDto {
    @NotNull(message = "{NOT_EMPTY}")
    private String name;
    @NotNull(message = "{NOT_EMPTY}")
    private String content;
    private String department;
}
