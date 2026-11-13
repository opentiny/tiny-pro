package com.TinyPro.entity.dto;

import lombok.Data;

/**
 * 员工新增请求。
 */
@Data
public class EmployeeCreateRequest {

    private String name;
    private String employeeNo;
    private String department;
    private String departmentLevel;
    private String status;
    private String workbenchName;
    private String project;
    private String type;
    private String address;
    private String roles;
    private String lastUpdateUser;
    private String createTime;
}
