package com.TinyPro.entity.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springdoc.core.annotations.ParameterObject;

@Data
@ParameterObject
public class ApplicationPaginationQueryDto {

    @Parameter(description = "页数，必须是一个大于零的正整数", example = "1")
    @Min(value = 1, message = "{page.min}")
    private Integer page = 1;

    @Parameter(description = "页大小，必须是一个正整数，最大 100", example = "10")
    @Min(value = 1, message = "{limit.min}")
    @Max(value = 100, message = "{limit.max}")
    private Integer limit = 1;

    @Parameter(description = "类型")
    private String classify;

    @Parameter(description = "关键字")
    private String keywords;
}
