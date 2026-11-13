package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.EmployeeCreateRequest;
import com.TinyPro.entity.dto.EmployeeQueryDto;
import com.TinyPro.entity.dto.EmployeeUpdateRequest;
import com.TinyPro.entity.vo.EmployeePageVo;
import com.TinyPro.entity.vo.EmployeeVo;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.IEmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 成员的操作类
 */
@RequestMapping("/employee")
@RestController
public class EmployeesController {
    private final IEmployeeService employeeService;

    @Autowired
    public EmployeesController(IEmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/getEmployee")
    public ApiResponse<EmployeePageVo> getEmployee(
            @Valid @RequestBody(required = false) EmployeeQueryDto query) {
        return ApiResponse.success(employeeService.queryPage(query));
    }

    @PostMapping("/getEmployeeInfo")
    public ApiResponse<EmployeeVo> getEmployeeInfo(@RequestBody(required = false) java.util.Map<String, Object> params) {
        Object id = params == null ? null : params.get("id");
        return ApiResponse.success(EmployeeVo.from(employeeService.getById(id == null ? "" : String.valueOf(id))));
    }

    @Reject
    @PermissionAnnotation("employee::add")
    @PostMapping("/create")
    public ApiResponse<EmployeeVo> createEmployee(@RequestBody(required = false) EmployeeCreateRequest request) {
        return ApiResponse.success(EmployeeVo.from(employeeService.create(request)));
    }

    @Reject
    @PermissionAnnotation("employee::update")
    @PostMapping("/updateEmployeeInfo")
    public ApiResponse<Boolean> updateEmployeeInfo(@RequestBody(required = false) EmployeeUpdateRequest request) {
        return ApiResponse.success(employeeService.update(request == null ? null : request.getData()));
    }

    @Reject
    @PermissionAnnotation("employee::remove")
    @DeleteMapping("/delete")
    public ApiResponse<Boolean> deleteEmployee(@RequestParam(value = "id", required = false) String id) {
        return ApiResponse.success(employeeService.remove(id));
    }

    @GetMapping("getEmployee/{id}")
    public ApiResponse<EmployeeVo> findOne(@PathVariable String id) {
        return ApiResponse.success(EmployeeVo.from(employeeService.getById(id)));
    }
}
