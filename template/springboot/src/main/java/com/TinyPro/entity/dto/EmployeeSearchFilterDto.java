package com.TinyPro.entity.dto;

import lombok.Data;

import java.util.List;

/**
 * 员工列表字段筛选条件，与 NestJS EmployeeSearchFilter 对齐。
 */
@Data
public class EmployeeSearchFilterDto {

    private String field;

    private List<Object> values;

    private String start;

    private String end;
}
