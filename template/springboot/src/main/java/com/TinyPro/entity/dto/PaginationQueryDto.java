package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;


@Data
public class PaginationQueryDto {

    @Min(value = 1, message = "{page.min}")
    private Integer page = 1;  // 默认值1，可通过配置覆盖

    @Min(value = 1, message = "{limit.min}")
    private Integer limit = 10; // 默认值10，可通过配置覆盖
}
