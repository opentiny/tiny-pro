package com.TinyPro.mock;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/mock/api/user")
public class MockUserDataService {

    @PostMapping("/data")
    public ResponseEntity<Map<String, Object>> getUserData(@RequestBody(required = false) Map<String, Object> params) {
        // 1. 构造完全符合你要求的 data 对象
        Map<String, Object> data = new LinkedHashMap<>(); // 保持插入顺序（可选）

        // 1.1 chartData
        List<Map<String, Object>> chartData = new ArrayList<>();

        // 第一个 chartData item: userInfo.week.1
        Map<String, Object> week1 = new LinkedHashMap<>();
        week1.put("title", "userInfo.week.1");
        week1.put("value", 1);

        List<Map<String, Object>> week1List = new ArrayList<>();
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionA", "len", 1, "bid", "A", "pid", "A"));
        week1List.add(createMap("type", "userInfo.type.optionC", "status", "userInfo.status.optionB", "len", 5, "bid", "c", "pid", "B"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionC", "len", 3, "bid", "A", "pid", "C"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionA", "len", 1, "bid", "A", "pid", "A"));
        week1List.add(createMap("type", "userInfo.type.optionB", "status", "userInfo.status.optionA", "len", 6, "bid", "B", "pid", "A"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionC", "len", 1, "bid", "A", "pid", "C"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionA", "len", 1, "bid", "A", "pid", "A"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionB", "len", 1, "bid", "A", "pid", "B"));
        week1List.add(createMap("type", "userInfo.type.optionB", "status", "userInfo.status.optionA", "len", 1, "bid", "B", "pid", "A"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionC", "len", 1, "bid", "A", "pid", "C"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionD", "len", 1, "bid", "A", "pid", "D"));
        week1List.add(createMap("type", "userInfo.type.optionC", "status", "userInfo.status.optionD", "len", 1, "bid", "C", "pid", "D"));
        week1List.add(createMap("type", "userInfo.type.optionA", "status", "userInfo.status.optionD", "len", 1, "bid", "A", "pid", "D"));

        week1.put("list", week1List);

        // 其它 chartData items: userInfo.month.1 到 userInfo.month.17，value = 0
        for (int i = 1; i <= 17; i++) {
            String title = "userInfo.month." + i;
            if (i == 1) continue; // 已添加

            Map<String, Object> monthItem = new LinkedHashMap<>();
            monthItem.put("title", title);
            monthItem.put("value", 0);
            chartData.add(monthItem);
        }

        // 添加 week1 到 chartData 最前面
        chartData.add(0, week1);

        // 1.2 tableData
        List<Map<String, Object>> tableData = new ArrayList<>();
        tableData.add(createMap("id", "1", "bid", "A", "pid", "D", "name", "GFD Company", "time", "2021-12-18", "type", "userInfo.type.optionA", "status", "userInfo.status.optionD"));
        tableData.add(createMap("id", "2", "bid", "B", "pid", "A", "name", "WWWW Company", "time", "2021-11-18", "type", "userInfo.type.optionB", "status", "userInfo.status.optionA"));
        tableData.add(createMap("id", "3", "bid", "C", "pid", "B", "name", "TGBYX Company", "time", "2021-10-18", "type", "userInfo.type.optionC", "status", "userInfo.status.optionB"));
        tableData.add(createMap("id", "4", "bid", "B", "pid", "D", "name", "GF Company", "time", "2021-09-18", "type", "userInfo.type.optionB", "status", "userInfo.status.optionC"));
        tableData.add(createMap("id", "5", "bid", "C", "pid", "C", "name", "Property management company", "time", "2021-07-18", "type", "userInfo.type.optionA", "status", "userInfo.status.optionD"));
        tableData.add(createMap("id", "6", "bid", "A", "pid", "C", "name", "Property management company", "time", "2020-12-23", "type", "userInfo.type.optionA", "status", "userInfo.status.optionC"));
        tableData.add(createMap("id", "7", "bid", "B", "pid", "C", "name", "GF Company", "time", "2020-11-08", "type", "userInfo.type.optionB", "status", "userInfo.status.optionC"));
        tableData.add(createMap("id", "8", "bid", "B", "pid", "C", "name", "WWWW Company", "time", "2020-10-18", "type", "userInfo.type.optionB", "status", "userInfo.status.optionC"));
        tableData.add(createMap("id", "9", "bid", "C", "pid", "D", "name", "WWWW Company", "time", "2020-10-11", "type", "userInfo.type.optionC", "status", "userInfo.status.optionD"));
        tableData.add(createMap("id", "10", "bid", "C", "pid", "D", "name", "TGBYX Company", "time", "2020-06-18", "type", "userInfo.type.optionC", "status", "userInfo.status.optionD"));

        // 1.3 userInfo
        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("userId", "10000");
        userInfo.put("username", "admin");
        userInfo.put("department", "Tiny-Vue-Pro");
        userInfo.put("employeeType", "social recruitment");
        userInfo.put("role", "admin");
        userInfo.put("job", "Front end");
        userInfo.put("probationStart", "2021-04-19");
        userInfo.put("probationEnd", "2021-10-15");
        userInfo.put("probationDuration", 180);
        userInfo.put("protocolStart", "2021-04-19");
        userInfo.put("protocolEnd", "2024-04-19");
        userInfo.put("address", "xian");
        userInfo.put("status", "normal");

        // 2. 组装 data
        data.put("chartData", chartData);
        data.put("tableData", tableData);
        data.put("userInfo", userInfo);

        // 3. 包装返回
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");

        return ResponseEntity.ok(response);
    }

    // ✅ 工具方法：快速构造 Map<String, Object>
    private Map<String, Object> createMap(Object... keyValuePairs) {
        if (keyValuePairs.length % 2 != 0) {
            throw new IllegalArgumentException("参数必须是 key-value 成对出现");
        }
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < keyValuePairs.length; i += 2) {
            String key = keyValuePairs[i].toString();
            Object value = keyValuePairs[i + 1];
            map.put(key, value);
        }
        return map;
    }
}