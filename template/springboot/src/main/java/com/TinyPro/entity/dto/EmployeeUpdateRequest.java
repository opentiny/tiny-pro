package com.TinyPro.entity.dto;

import lombok.Data;

import java.util.Map;

/**
 * 员工更新请求，与 NestJS updateEmployeeInfo 的 data 信封对齐。
 */
@Data
public class EmployeeUpdateRequest {

    private Map<String, Object> data;
}
