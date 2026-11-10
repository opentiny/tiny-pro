package com.TinyPro.controller;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.po.Employee;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.mock.MockListController;
import com.TinyPro.service.IEmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 成员的操作类
 */
@RequestMapping("/employee")
@RestController
public class EmployeesController {
    @Autowired
    private IEmployeeService employeeService;
    private final MockListController mockListController;

    @Autowired
    public EmployeesController(MockListController mockListController) {
        this.mockListController = mockListController;
    }

    @IsPublic
    @RequestMapping(value = "/getEmployee", method = {RequestMethod.GET, RequestMethod.POST})
    public Map<String, Object> getEmployee(@RequestBody(required = false) Map<String, Object> params) {
        return mockListController.getEmployee(params);
    }

    @IsPublic
    @DeleteMapping("/delete")
    public ApiResponse<Boolean> deleteEmployee(@RequestParam(value = "id", required = false) String id) {
        return mockListController.deleteEmployee(id);
    }

    @GetMapping("getEmployee/{id}")
    public ResponseEntity<Employee> findOne(@PathVariable String id) {
        return new ResponseEntity<>(employeeService.getById(id), HttpStatus.OK);
    }
}
