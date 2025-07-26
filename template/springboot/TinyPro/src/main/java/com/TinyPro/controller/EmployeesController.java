package com.TinyPro.controller;

import com.TinyPro.entity.po.Employee;
import com.TinyPro.service.IEmployeeService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 成员的操作类
 */
@RequestMapping("/employee")
@RestController
public class EmployeesController {
    @Autowired
    private IEmployeeService employeeService;

    @PostMapping("/getEmployee")
    public ResponseEntity<List<Employee>> getEmployee(@RequestBody List<String> searchInfo) {
        QueryWrapper<Employee> employeeQueryWrapper = new QueryWrapper<>();
        employeeQueryWrapper.in("id", searchInfo);
        return new ResponseEntity<>(employeeService.list(employeeQueryWrapper), HttpStatus.OK);
    }

    @GetMapping("getEmployee/{id}")
    public ResponseEntity<Employee> findOne(@PathVariable String id) {
        return new ResponseEntity<>(employeeService.getById(id), HttpStatus.OK);
    }
}
