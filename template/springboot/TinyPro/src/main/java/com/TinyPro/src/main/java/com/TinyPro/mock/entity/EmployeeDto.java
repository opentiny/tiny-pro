package com.TinyPro.mock.entity;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class EmployeeDto {
    private Integer pageIndex;
    private Integer pageSize;
    private Map<String, Object> searchInfo;
}
