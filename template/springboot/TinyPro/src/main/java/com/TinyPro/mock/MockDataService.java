package com.TinyPro.mock;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/mock/api/user")
public class MockDataService {

    // 模拟数据初始化
    private static final Map<String, Object> initData = new HashMap<>() {{
        put("options", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "1"); put("label", "work.mock.employees"); }},
            new HashMap<String, String>() {{ put("value", "2"); put("label", "work.mock.onboard"); }},
            new HashMap<String, String>() {{ put("value", "3"); put("label", "work.mock.Test"); }}
        ));
    }};

    private static final Map<String, Object> initData1 = new HashMap<>() {{
        put("options", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "1"); put("label", "work.mock.week1"); }},
            new HashMap<String, String>() {{ put("value", "2"); put("label", "work.mock.week2"); }},
            new HashMap<String, String>() {{ put("value", "3"); put("label", "work.mock.week3"); }}
        ));
    }};

    private static final Map<String, Object> initData2 = new HashMap<>() {{
        put("options", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "1"); put("label", "work.mock.network"); }},
            new HashMap<String, String>() {{ put("value", "2"); put("label", "work.mock.centralized"); }},
            new HashMap<String, String>() {{ put("value", "3"); put("label", "work.mock.hardware"); }}
        ));
    }};

    private static final Map<String, Object> changeDate = new HashMap<>() {{
        put("options1", Arrays.asList(101, 212, 122, 232));
        put("options2", Arrays.asList(323, 555, 425, 2221));
        put("options3", Arrays.asList(23234, 234, 989, 122));
    }};

    @GetMapping("/getdata")
    public ResponseEntity<Map<String, Object>> getData() {
        return ResponseEntity.ok(successResponseWrap(initData));
    }

    @GetMapping("/getrpractic")
    public ResponseEntity<Map<String, Object>> getPractic() {
        return ResponseEntity.ok(successResponseWrap(initData1));
    }

    @GetMapping("/getrtrain")
    public ResponseEntity<Map<String, Object>> getTrain() {
        return ResponseEntity.ok(successResponseWrap(initData2));
    }

    @PostMapping("/getselect")
    public ResponseEntity<Map<String, Object>> getSelect(@RequestParam Integer body) {

        Object result = null;
        
        if (body == 1) {
            result = successResponseWrap(changeDate.get("options1"));
        } else if (body == 2) {
            result = successResponseWrap(changeDate.get("options2"));
        } else {
            result = successResponseWrap(changeDate.get("options3"));
        }
        
        return ResponseEntity.ok((Map<String, Object>) result);
    }

    private Map<String, Object> successResponseWrap(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");
        return response;
    }
}
