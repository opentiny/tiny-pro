package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PaginationQueryDto {

    @Min(1)
    private Integer page = 1;  // 默认值1，可通过配置覆盖

    @Min(1)
    private Integer limit = 10; // 默认值10，可通过配置覆盖
}
