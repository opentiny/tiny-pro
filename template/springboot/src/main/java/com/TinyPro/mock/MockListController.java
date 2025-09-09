package com.TinyPro.mock;

import com.TinyPro.mock.ApiResponse;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/mock/api/employee")
public class MockListController {
    private static final List<Map<String, Object>> taskList = generateMockTaskList(60);
    private static List<Map<String, Object>> generateMockTaskList(int count) {
        List<Map<String, Object>> mockList = new ArrayList<>();
        String[] names = {"xiaoming", "xiaohong", "xiaoli", "xiaowang", "xiaozhang", "xiaochen"};
        String[] ranks = {"初级", "中级", "高级", "专家", "资深"};
        String[] types = {"Tiny Design", "UI Design", "UX Design", "Frontend", "Backend", "Fullstack"};
        String[] roles = {"前端", "后端", "全栈", "测试", "产品", "设计"};
        String[] departments = {"公共服务", "技术部", "产品部", "设计部", "测试部", "运营部"};
        String[] departmentLevels = {"初级", "中级", "高级", "专家", "资深"};
        String[] workbenches = {"work", "design", "develop", "test", "ops", "manage"};
        String[] projects = {"TinyDesign", "BigProject", "MiniApp", "MicroService", "CloudPlatform", "AIEngine"};
        String[] addresses = {"西安研究所", "北京总部", "上海分部", "深圳中心", "广州办事处", "成都研发中心"};
        String[] lastUpdateUsers = {"张三", "李四", "王五", "赵六", "钱七", "孙八"};

        for (int i = 0; i < count; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", (i + 1)+"");
            item.put("name", names[ThreadLocalRandom.current().nextInt(names.length)] + "_" + (i + 1));
            item.put("rank", ranks[ThreadLocalRandom.current().nextInt(ranks.length)]);
            item.put("description", "这是一段关于" + item.get("name") + "的描述文字，创建于模拟数据中");
            item.put("createTime", LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(30)).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            item.put("status", String.valueOf(ThreadLocalRandom.current().nextInt(3))); // 0, 1, 2
            item.put("type", types[ThreadLocalRandom.current().nextInt(types.length)]);
            item.put("roles", roles[ThreadLocalRandom.current().nextInt(roles.length)]);
            item.put("employeeNo",  ThreadLocalRandom.current().nextInt(999999));
            item.put("department", departments[ThreadLocalRandom.current().nextInt(departments.length)]);
            item.put("departmentLevel", departmentLevels[ThreadLocalRandom.current().nextInt(departmentLevels.length)]);
            item.put("workbenchName", workbenches[ThreadLocalRandom.current().nextInt(workbenches.length)]);
            item.put("project", projects[ThreadLocalRandom.current().nextInt(projects.length)]);
            item.put("address", addresses[ThreadLocalRandom.current().nextInt(addresses.length)]);
            item.put("lastUpdateUser", lastUpdateUsers[ThreadLocalRandom.current().nextInt(lastUpdateUsers.length)]);

            mockList.add(item);
        }
        return mockList;
    }
    @PostMapping("/getEmployee")
    public Map<String, Object> getEmployee(@RequestBody(required = false) Map<String, Object> params) {
        try {
            int pageIndex = 1;
            int pageSize = 10;

            // 1. 解析 pageIndex 和 pageSize（兼容多种传参方式）
            if (params != null) {
                if (params.containsKey("body")) {
                    Object body = params.get("body");
                    if (body instanceof Map) {
                        Map<?, ?> bodyMap = (Map<?, ?>) body;
                        if (bodyMap.containsKey("pageIndex")) {
                            Object idx = bodyMap.get("pageIndex");
                            if (idx instanceof Number) pageIndex = ((Number) idx).intValue();
                        }
                        if (bodyMap.containsKey("pageSize")) {
                            Object sz = bodyMap.get("pageSize");
                            if (sz instanceof Number) pageSize = ((Number) sz).intValue();
                        }
                    }
                } else {
                    if (params.containsKey("pageIndex")) {
                        Object idx = params.get("pageIndex");
                        if (idx instanceof Number) pageIndex = ((Number) idx).intValue();
                    }
                    if (params.containsKey("pageSize")) {
                        Object sz = params.get("pageSize");
                        if (sz instanceof Number) pageSize = ((Number) sz).intValue();
                    }
                }
            }

            // 限制最小值为 1
            pageIndex = Math.max(1, pageIndex);
            pageSize = Math.max(1, pageSize);

            int offset = (pageIndex - 1) * pageSize;
            int total = taskList.size();
            int end = Math.min(offset + pageSize, total);
            int count = Math.max(0, end - offset);

            // 2. 获取分页数据
            List<Map<String, Object>> pagedData = taskList.stream()
                    .skip(offset)
                    .limit(count)
                    .collect(Collectors.toList());

            // 3. 构造你期望的返回结构
            Map<String, Object> data = new HashMap<>();
            data.put("total", total);
            data.put("data", pagedData);

            Map<String, Object> result = new HashMap<>();
            result.put("data", data);
            result.put("errMsg", "");
            result.put("code", "0");

            return result;

        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("data", null);
            errorResult.put("errMsg", "获取员工数据失败: " + e.getMessage());
            errorResult.put("code", "500");
            return errorResult;
        }
    }
}