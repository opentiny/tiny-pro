package com.TinyPro.mock;

import com.TinyPro.mock.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/mock/api/user")
public class MockBoardController {
    private final List<Map<String, String>> mockGetData = List.of(
            Map.of("value", "1", "label", "work.mock.employees"),
            Map.of("value", "2", "label", "work.mock.onboard"),
            Map.of("value", "3", "label", "work.mock.Test")
    );

    private final List<Map<String, String>> mockGetRPractic = List.of(
            Map.of("value", "1", "label", "work.mock.week1"),
            Map.of("value", "2", "label", "work.mock.week2"),
            Map.of("value", "3", "label", "work.mock.week3")
    );

    private final List<Map<String, Object>> mockGetRTrain = List.of(
            Map.of(
                    "value", "work.mock.collectValue1",
                    "description", "work.mock.collectDescription1",
                    "label1", "work.mock.collectHotLabel1",
                    "label2", "work.mock.collectLabel2",
                    "isNews", false
            ),
            Map.of(
                    "value", "work.mock.collectValue2",
                    "description", "work.mock.collectDescription2",
                    "label1", "work.mock.collectHotLabel1",
                    "label2", "work.mock.collectLabel3",
                    "isNews", false
            ),
            Map.of(
                    "value", "work.mock.collectValue3",
                    "description", "work.mock.collectDescription3",
                    "label1", "work.mock.collectHotLabel1",
                    "label2", "work.mock.collectLabel4",
                    "isNews", false
            ),
            Map.of(
                    "value", "work.mock.collectValue4",
                    "description", "work.mock.collectDescription4",
                    "label1", "work.mock.collectHotLabel1",
                    "label2", "work.mock.collectLabel5",
                    "isNews", true
            )
    );

    private final Map<Integer, List<Integer>> mockSelectOptions = Map.of(
            1, List.of(101, 212, 122, 232),
            2, List.of(323, 555, 425, 2221),
            3, List.of(23234, 234, 989, 122)
    );

    @GetMapping("/getdata")
    public ApiResponse<List<Map<String, String>>> getData() {
        return ApiResponse.success(mockGetData, "获取数据成功", 20000);
    }

    @GetMapping("/getrpractic")
    public ApiResponse<List<Map<String, String>>> getRPractic() {
        return ApiResponse.success(mockGetRPractic, "获取实训数据成功", 20000);
    }

    @GetMapping("/getrtrain")
    public Map<String, Object> getRTrain() {
        List<Map<String, Object>> options = List.of(
                Map.of(
                        "value", "work.mock.collectValue1",
                        "description", "work.mock.collectDescription1",
                        "label1", "work.mock.collectHotLabel1",
                        "label2", "work.mock.collectLabel2",
                        "isNews", false
                ),
                Map.of(
                        "value", "work.mock.collectValue2",
                        "description", "work.mock.collectDescription2",
                        "label1", "work.mock.collectHotLabel1",
                        "label2", "work.mock.collectLabel3",
                        "isNews", false
                ),
                Map.of(
                        "value", "work.mock.collectValue3",
                        "description", "work.mock.collectDescription3",
                        "label1", "work.mock.collectHotLabel1",
                        "label2", "work.mock.collectLabel4",
                        "isNews", false
                ),
                Map.of(
                        "value", "work.mock.collectValue4",
                        "description", "work.mock.collectDescription4",
                        "label1", "work.mock.collectHotLabel1",
                        "label2", "work.mock.collectLabel5",
                        "isNews", true
                )
        );

        // 构造最终返回结构
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("options", options);

        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");

        return response;
    }

    @PostMapping("/getselect")
    public ApiResponse<List<Integer>> getSelect(@RequestBody Map<String, Object> requestBody) {
        Integer selected = null;

        if (requestBody != null && requestBody.containsKey("body")) {
            Object bodyValue = requestBody.get("body");
            if (bodyValue instanceof Integer) {
                selected = (Integer) bodyValue;
            } else if (bodyValue instanceof String) {
                try {
                    selected = Integer.parseInt((String) bodyValue);
                } catch (NumberFormatException ignored) {
                }
            }
        }

        List<Integer> result = mockSelectOptions.getOrDefault(selected, Collections.emptyList());
        return ApiResponse.success(result, "获取选择数据成功", 20000);
    }
}