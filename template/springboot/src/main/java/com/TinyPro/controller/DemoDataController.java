package com.TinyPro.controller;

import com.TinyPro.annotation.Reject;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.DemoDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Demo endpoints aligned with the NestJS DemoDataController.
 */
@RestController
public class DemoDataController {

    private final DemoDataService demoDataService;

    public DemoDataController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping("/board/home")
    public Map<String, Object> getBoardHome() {
        return demoDataService.getBoardHome();
    }

    @GetMapping("/user/getdata")
    public ApiResponse<Map<String, Object>> getUserData() {
        return ApiResponse.success(demoDataService.getWorkPlan());
    }

    @GetMapping("/user/getrpractic")
    public ApiResponse<Map<String, Object>> getUserPractice() {
        return ApiResponse.success(demoDataService.getWorkPractice());
    }

    @GetMapping("/user/getrtrain")
    public Map<String, Object> getUserTrain() {
        return demoDataService.getWorkTraining();
    }

    @PostMapping("/user/getselect")
    public ApiResponse<List<Integer>> getUserSelect(@RequestBody(required = false) Map<String, Object> body) {
        return ApiResponse.success(demoDataService.getWorkPracticeChart(body));
    }

    @PostMapping("/user/data")
    public ApiResponse<Map<String, Object>> getUserCenterData(
            @RequestBody(required = false) Map<String, Object> body) {
        return ApiResponse.success(demoDataService.getUserCenterData(body));
    }

    @Reject
    @PostMapping("/channel-form/submit")
    public ApiResponse<String> submitStepForm(
            @RequestBody(required = false) Map<String, Object> body) {
        demoDataService.saveSubmission(body == null ? Map.of() : body);
        return ApiResponse.success("ok");
    }

    @GetMapping("/detail/getdata")
    public ApiResponse<Map<String, Object>> getDetailData() {
        return ApiResponse.success(demoDataService.getProfileDetail());
    }
}
