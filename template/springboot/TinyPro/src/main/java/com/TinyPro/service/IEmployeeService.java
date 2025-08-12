package com.TinyPro.service;

import com.TinyPro.entity.po.Employee;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface IEmployeeService {
    List<Employee> list(List<Long> employeeQueryWrapper);

    Employee getById(String id);
}
