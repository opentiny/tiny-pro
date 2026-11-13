package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Employee;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 员工接口响应，与 NestJS Employee 的字符串字段契约保持一致。
 */
@Data
public class EmployeeVo {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private String id;
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

    public static EmployeeVo from(Employee employee) {
        if (employee == null) {
            return null;
        }
        EmployeeVo vo = new EmployeeVo();
        vo.id = employee.getId() == null ? null : String.valueOf(employee.getId());
        vo.name = employee.getName();
        vo.employeeNo = employee.getEmployeeNo();
        vo.department = employee.getDepartment();
        vo.departmentLevel = employee.getDepartmentLevel();
        vo.status = employee.getStatus();
        vo.workbenchName = employee.getWorkbenchName();
        vo.project = employee.getProject();
        vo.type = employee.getType();
        vo.address = employee.getAddress();
        vo.roles = employee.getRoles();
        vo.lastUpdateUser = employee.getLastUpdateUser();
        vo.createTime = formatTime(employee.getCreateTime());
        return vo;
    }

    private static String formatTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMATTER);
    }
}
