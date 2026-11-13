package com.TinyPro.entity.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 员工分页查询请求，与 NestJS EmployeeQueryBody 对齐。
 */
@Data
public class EmployeeQueryDto {

    @Min(value = 1, message = "{page.min}")
    private Integer pageIndex = 1;

    @Min(value = 1, message = "{page.min}")
    private Integer pageSize = 10;

    @Valid
    private EmployeeSearchInfoDto searchInfo;
}
