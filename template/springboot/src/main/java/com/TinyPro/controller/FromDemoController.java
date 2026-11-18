package com.TinyPro.controller;

import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.FormDemoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Form demo endpoints backed by the form_option table.
@RestController
public class FromDemoController {

    private final FormDemoService formDemoService;

    public FromDemoController(FormDemoService formDemoService) {
        this.formDemoService = formDemoService;
    }

    @GetMapping("/base/getdata")
    public ApiResponse<Map<String, Object>> getBaseData() {
        return ApiResponse.success(formDemoService.getFormData(), "获取基础数据成功", 20000);
    }

    @GetMapping("/step/getdata")
    public ApiResponse<Map<String, Object>> getStepData() {
        return ApiResponse.success(formDemoService.getFormData(), "获取步骤数据成功", 20000);
    }

    @GetMapping("/advance/getdata")
    public ApiResponse<Map<String, Object>> getAdvanceData() {
      return ApiResponse.success(formDemoService.getFormData(), "request success", 20000);
    }
}
