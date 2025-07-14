package com.TinyPro.controller;

import com.TinyPro.entity.po.Employee;
import com.TinyPro.service.IEmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 成员的操作类
 */
@RequestMapping("/employee")
@RestController
public class EmployeesController {
    @Autowired
    private IEmployeeService employeeService;
    @PostMapping("/getEmployee")
    public ResponseEntity<Employee[]> getEmployee(@RequestBody String searchInfo){
        return null;
    }
    @GetMapping("getEmployee/:id")
    public ResponseEntity<Employee> findOne(@PathVariable String id){
       return new ResponseEntity<>(employeeService.getById(id), HttpStatus.OK);
    }
}
