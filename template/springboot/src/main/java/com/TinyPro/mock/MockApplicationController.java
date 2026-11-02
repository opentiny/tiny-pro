package com.TinyPro.mock;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Mock application list used by the front-end demo pages. */
@RestController
@RequestMapping("/mock/api")
public class MockApplicationController {

    private final List<Map<String, Object>> applications = createApplications();

    @GetMapping("/application")
    public ApiResponse<Map<String, Object>> getApplications(
            @RequestBody(required = false) Map<String, Object> requestBody
    ) {
        int pageIndex = number(requestBody, "pageIndex", 1);
        int pageSize = number(requestBody, "pageSize", 10);
        pageIndex = Math.max(1, pageIndex);
        pageSize = Math.max(1, pageSize);

        long requestedOffset = (long) (pageIndex - 1) * pageSize;
        long requestedEnd = requestedOffset + pageSize;
        int offset = (int) Math.min(requestedOffset, applications.size());
        int end = (int) Math.min(requestedEnd, applications.size());
        Map<String, Object> data = new HashMap<>();
        data.put("total", applications.size());
        data.put("data", new ArrayList<>(applications.subList(offset, end)));
        return ApiResponse.successSimple(data);
    }

    private int number(Map<String, Object> body, String key, int fallback) {
        if (body == null || body.get(key) == null) {
            return fallback;
        }
        try {
            return Integer.parseInt(String.valueOf(body.get(key)));
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }

    private List<Map<String, Object>> createApplications() {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] icons = {"logo-top2.png", "info1.png", "info2.png"};
        for (int i = 1; i <= 60; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", String.valueOf(i));
            item.put("name", "Tiny Design " + i);
            item.put("description", "HUA WEI CLOUD PRODUCT AND SERVICES DESIGN");
            item.put("tag", List.of(Map.of("type", "success", "value", "design")));
            item.put("icon", icons[(i - 1) % icons.length]);
            result.add(item);
        }
        return result;
    }
}
