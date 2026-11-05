package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaginationQueryDto {

    @Min(value = 1, message = "{page.min}")
    @NotNull(message = "{page.required}")
    private Integer page = 1;  // 默认值1，可通过配置覆盖

    @Min(value = 1, message = "{limit.min}")
    @NotNull(message = "{limit.required}")
    private Integer limit = 10; // 默认值10，可通过配置覆盖
}
