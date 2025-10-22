package com.TinyPro.mock;

import com.TinyPro.mock.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/mock")
public class MockFromController {
    private final List<Map<String, String>> mockPosition = List.of(
            Map.of("value", "1", "label", "position1"),
            Map.of("value", "2", "label", "position2"),
            Map.of("value", "3", "label", "position3"),
            Map.of("value", "4", "label", "position4")
    );

    private final List<Map<String, String>> mockHR = List.of(
            Map.of("value", "1", "label", "test01"),
            Map.of("value", "2", "label", "test01"),
            Map.of("value", "3", "label", "test03")
    );

    private final List<String> mockMentor = List.of(
            "Teacher1", "Teacher2", "Teacher3", "Teacher4"
    );

    private final List<String> mockDirector = List.of(
            "Director1", "Director2", "Director3", "Director4"
    );

    private final Map<String, Object> initBase = Map.of(
            "position", mockPosition,
            "HR", mockHR,
            "mentor", mockMentor,
            "director", mockDirector
    );


    @GetMapping("/api/base/getdata")
    public ApiResponse<Map<String, Object>> getBaseData() {
        return ApiResponse.success(initBase, "获取基础数据成功", 20000);
    }

    @GetMapping("/api/step/getdata")
    public ApiResponse<Map<String, Object>> getStepData() {
        return ApiResponse.success(initBase, "获取步骤数据成功", 20000);
    }

    @PostMapping("/api/channel-form/submit")
    public ApiResponse<String> submitChannelForm() {
        return ApiResponse.success("ok", "提交成功", 20000);
    }
}