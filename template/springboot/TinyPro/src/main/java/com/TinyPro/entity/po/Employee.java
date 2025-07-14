package com.TinyPro.entity.po;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "employee_no")
    private String employeeNo;

    @Column(name = "department")
    private String department;

    @Column(name = "department_level")
    private String departmentLevel;

    @Column(name = "status")
    private String status;

    @Column(name = "workbench_name")
    private String workbenchName;

    @Column(name = "project")
    private String project;

    @Column(name = "type")
    private String type;

    @Column(name = "address")
    private String address;

    @Column(name = "roles")
    private String roles;

    @Column(name = "last_update_user")
    private String lastUpdateUser;

    @Column(name = "create_time")
    private LocalDateTime createTime;


}