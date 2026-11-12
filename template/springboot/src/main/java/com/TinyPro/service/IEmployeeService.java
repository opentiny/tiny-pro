package com.TinyPro.service;

import com.TinyPro.entity.po.Employee;
import com.TinyPro.entity.dto.EmployeeQueryDto;
import com.TinyPro.entity.vo.EmployeePageVo;

import java.util.List;
import java.util.Map;

public interface IEmployeeService {
    List<Employee> list(List<Long> employeeQueryWrapper);

    EmployeePageVo queryPage(EmployeeQueryDto query);

    Employee getById(String id);

    boolean update(Map<String, Object> data);

    boolean remove(String id);
}
