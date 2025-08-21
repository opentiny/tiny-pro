package com.TinyPro.mock;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/mock/api")
public class MockUserInfoService {

    // 模拟数据初始化
    private static final Map<String, Object> initData = new HashMap<>() {{
        // chartData部分
        put("chartData", Arrays.asList(
            new HashMap<String, Object>() {{
                put("title", "userInfo.week.1");
                put("value", 1);
                put("list", Arrays.asList(
                    new HashMap<String, Object>() {{
                        put("type", "userInfo.type.optionA");
                        put("status", "userInfo.status.optionA");
                        put("len", 1);
                        put("bid", "A");
                        put("pid", "A");
                    }},
                    new HashMap<String, Object>() {{
                        put("type", "userInfo.type.optionC");
                        put("status", "userInfo.status.optionB");
                        put("len", 5);
                        put("bid", "c");
                        put("pid", "B");
                    }},
                    // 其他list项...
                    new HashMap<String, Object>() {{
                        put("type", "userInfo.type.optionA");
                        put("status", "userInfo.status.optionD");
                        put("len", 1);
                        put("bid", "A");
                        put("pid", "D");
                    }}
                ));
            }},
            // 其他chartData项...
            new HashMap<String, Object>() {{
                put("title", "userInfo.month.17");
                put("value", 0);
            }}
        ));

        // tableData部分
        put("tableData", Arrays.asList(
            new HashMap<String, Object>() {{
                put("id", "1");
                put("bid", "A");
                put("pid", "D");
                put("name", "GFD Company");
                put("time", "2021-12-18");
                put("type", "userInfo.type.optionA");
                put("status", "userInfo.status.optionD");
            }},
            // 其他tableData项...
            new HashMap<String, Object>() {{
                put("id", "10");
                put("bid", "C");
                put("pid", "D");
                put("name", "TGBYX Company");
                put("time", "2020-06-18");
                put("type", "userInfo.type.optionC");
                put("status", "userInfo.status.optionD");
            }}
        ));

        // userInfo部分
        put("userInfo", new HashMap<String, Object>() {{
            put("userId", "10000");
            put("username", "admin");
            put("department", "Tiny-Vue-Pro");
            put("employeeType", "social recruitment");
            put("role", "admin");
            put("job", "Front end");
            put("probationStart", "2021-04-19");
            put("probationEnd", "2021-10-15");
            put("probationDuration", "180");
            put("protocolStart", "2021-04-19");
            put("protocolEnd", "2024-04-19");
            put("address", "xian");
            put("status", "normal");
        }});
    }};

    @GetMapping("/userinfo")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        return ResponseEntity.ok(successResponseWrap(initData));
    }

    private Map<String, Object> successResponseWrap(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");
        return response;
    }
}