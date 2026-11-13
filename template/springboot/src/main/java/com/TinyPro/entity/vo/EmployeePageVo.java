package com.TinyPro.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 员工分页响应，与 NestJS queryPage 返回结构对齐。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePageVo {

    private long total;

    private List<EmployeeVo> data;

    private Map<String, Object> filters;
}
