package com.TinyPro.entity.dto;

import lombok.Data;
import jakarta.validation.Valid;

import java.util.List;

/**
 * 员工列表搜索条件，与 NestJS EmployeeSearchInfo 对齐。
 */
@Data
public class EmployeeSearchInfoDto {

    private String keyword;

    @Valid
    private List<EmployeeSearchFilterDto> filters;
}
