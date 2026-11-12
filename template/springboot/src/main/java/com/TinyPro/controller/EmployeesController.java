package com.TinyPro.controller;

import com.TinyPro.annotation.Reject;
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

    @RequestMapping(value = "/getEmployee", method = {RequestMethod.GET, RequestMethod.POST})
    public ApiResponse<EmployeePageVo> getEmployee(
            @Valid @RequestBody(required = false) EmployeeQueryDto query) {
        return ApiResponse.success(employeeService.queryPage(query));
    }

    @RequestMapping(value = "/getEmployeeInfo", method = {RequestMethod.GET, RequestMethod.POST})
    public ApiResponse<EmployeeVo> getEmployeeInfo(@RequestBody(required = false) java.util.Map<String, Object> params) {
        Object id = params == null ? null : params.get("id");
        return ApiResponse.success(EmployeeVo.from(employeeService.getById(id == null ? "" : String.valueOf(id))));
    }

    @Reject
    @PostMapping("/updateEmployeeInfo")
    public ApiResponse<Boolean> updateEmployeeInfo(@RequestBody(required = false) EmployeeUpdateRequest request) {
        return ApiResponse.success(employeeService.update(request == null ? null : request.getData()));
    }

    @Reject
    @DeleteMapping("/delete")
    public ApiResponse<Boolean> deleteEmployee(@RequestParam(value = "id", required = false) String id) {
        return ApiResponse.success(employeeService.remove(id));
    }

    @GetMapping("getEmployee/{id}")
    public ApiResponse<EmployeeVo> findOne(@PathVariable String id) {
        return ApiResponse.success(EmployeeVo.from(employeeService.getById(id)));
    }
}
