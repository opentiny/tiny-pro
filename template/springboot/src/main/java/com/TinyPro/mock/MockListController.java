package com.TinyPro.mock;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/mock/api/employee")
public class MockListController {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final List<String> FILTER_FIELDS = List.of(
            "name", "employeeNo", "departmentLevel", "department", "status",
            "workbenchName", "project", "type", "address", "roles", "lastUpdateUser"
    );
    private static final Set<String> FUZZY_FIELDS = Set.of("name", "employeeNo");
    private static final Map<String, List<String>> STATUS_KEYWORDS = Map.of(
            "0", List.of("已下线", "Offline"),
            "1", List.of("已上线", "Online"),
            "2", List.of("进行中", "Ongoing")
    );
    private static final List<Map<String, Object>> taskList = generateMockTaskList(60);
    private static List<Map<String, Object>> generateMockTaskList(int count) {
        List<Map<String, Object>> mockList = new ArrayList<>();
        String[] names = {"xiaoming", "xiaohong", "xiaoli", "xiaowang", "xiaozhang", "xiaochen"};
        String[] ranks = {"初级", "中级", "高级", "专家", "资深"};
        String[] types = {"Tiny Design", "UI Design", "UX Design", "Frontend", "Backend", "Fullstack"};
        String[] roles = {"前端", "后端", "全栈", "测试", "产品", "设计"};
        String[] departments = {"公共服务", "技术部", "产品部", "设计部", "测试部", "运营部"};
        String[] departmentLevels = {"一级", "二级", "三级", "四级"};
        String[] workbenches = {"work", "design", "develop", "test", "ops", "manage"};
        String[] projects = {"TinyDesign", "BigProject", "MiniApp", "MicroService", "CloudPlatform", "AIEngine"};
        String[] addresses = {"西安研究所", "北京总部", "上海分部", "深圳中心", "广州办事处", "成都研发中心"};
        String[] lastUpdateUsers = {"张三", "李四", "王五", "赵六", "钱七", "孙八"};

        Set<String> usedEmployeeNos = new HashSet<>();
        for (int i = 0; i < count; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", (i + 1)+"");
            item.put("name", names[ThreadLocalRandom.current().nextInt(names.length)] + "_" + (i + 1));
            item.put("rank", ranks[ThreadLocalRandom.current().nextInt(ranks.length)]);
            item.put("description", "这是一段关于" + item.get("name") + "的描述文字，创建于模拟数据中");
            item.put("createTime", LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(30)).format(DATE_TIME_FORMATTER));
            item.put("status", String.valueOf(ThreadLocalRandom.current().nextInt(3))); // 0, 1, 2
            item.put("type", types[ThreadLocalRandom.current().nextInt(types.length)]);
            item.put("roles", roles[ThreadLocalRandom.current().nextInt(roles.length)]);
            String employeeNo;
            do {
                employeeNo = String.format("00%06d", ThreadLocalRandom.current().nextInt(1_000_000));
            } while (!usedEmployeeNos.add(employeeNo));
            item.put("employeeNo", employeeNo);
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

            List<Map<String, Object>> filtered = filterTasks(readSearchInfo(params));
            int offset = (pageIndex - 1) * pageSize;
            int total = filtered.size();
            int end = Math.min(offset + pageSize, total);
            int count = Math.max(0, end - offset);

            // 2. 获取分页数据
            List<Map<String, Object>> pagedData = filtered.stream()
                    .skip(offset)
                    .limit(count)
                    .collect(Collectors.toList());

            // 3. 构造你期望的返回结构
            Map<String, Object> data = new HashMap<>();
            data.put("total", total);
            data.put("data", pagedData);
            data.put("filters", buildFilters());

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

    @PostMapping("/getEmployeeInfo")
    public Map<String, Object> getEmployeeInfo(@RequestBody(required = false) Map<String, Object> params) {
        String id = params == null || params.get("id") == null
                ? null
                : String.valueOf(params.get("id"));
        return taskList.stream()
                .filter(item -> Objects.equals(String.valueOf(item.get("id")), id))
                .findFirst()
                .orElseGet(HashMap::new);
    }

    @PostMapping("/updateEmployeeInfo")
    public boolean updateEmployeeInfo(@RequestBody(required = false) Map<String, Object> params) {
        if (params == null || !(params.get("data") instanceof Map<?, ?> data)) {
            return false;
        }

        Object id = data.get("id");
        for (Map<String, Object> item : taskList) {
            if (Objects.equals(String.valueOf(item.get("id")), String.valueOf(id))) {
                for (Map.Entry<?, ?> entry : data.entrySet()) {
                    if (entry.getKey() != null && !"id".equals(entry.getKey().toString())) {
                        item.put(entry.getKey().toString(), entry.getValue());
                    }
                }
                return true;
            }
        }
        return false;
    }

    @DeleteMapping("/delete")
    public ApiResponse<Boolean> deleteEmployee(
            @RequestParam(value = "id", required = false) String id
    ) {
        if (id != null && !id.isEmpty()) {
            taskList.removeIf(item -> Objects.equals(String.valueOf(item.get("id")), id));
        }
        return ApiResponse.successSimple(true);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readSearchInfo(Map<String, Object> params) {
        if (params == null) {
            return Collections.emptyMap();
        }
        Object source = params.get("body") instanceof Map ? params.get("body") : params;
        if (!(source instanceof Map)) {
            return Collections.emptyMap();
        }
        Object searchInfo = ((Map<String, Object>) source).get("searchInfo");
        if (searchInfo instanceof Map) {
            return (Map<String, Object>) searchInfo;
        }
        return Collections.emptyMap();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> filterTasks(Map<String, Object> searchInfo) {
        String keyword = searchInfo.get("keyword") instanceof String
                ? ((String) searchInfo.get("keyword")).trim()
                : "";
        List<Map<String, Object>> filters = new ArrayList<>();
        Object rawFilters = searchInfo.get("filters");
        if (rawFilters instanceof List) {
            for (Object item : (List<?>) rawFilters) {
                if (item instanceof Map) {
                    filters.add((Map<String, Object>) item);
                }
            }
        }
        return taskList.stream()
                .filter(row -> matchKeyword(row, keyword) && filters.stream().allMatch(filter -> matchFilter(row, filter)))
                .collect(Collectors.toList());
    }

    private boolean matchKeyword(Map<String, Object> row, String keyword) {
        if (keyword.isBlank()) {
            return true;
        }
        String haystack = buildHaystack(row);
        for (String token : keyword.split("\\s+")) {
            if (!haystack.contains(token.toLowerCase(Locale.ROOT))) {
                return false;
            }
        }
        return true;
    }

    private String buildHaystack(Map<String, Object> row) {
        List<String> parts = new ArrayList<>();
        for (String field : List.of(
                "name", "employeeNo", "department", "departmentLevel", "workbenchName",
                "project", "type", "address", "roles", "lastUpdateUser", "createTime", "status"
        )) {
            Object value = row.get(field);
            if (value != null) {
                parts.add(String.valueOf(value));
            }
        }
        List<String> statusText = STATUS_KEYWORDS.get(String.valueOf(row.get("status")));
        if (statusText != null) {
            parts.addAll(statusText);
        }
        return String.join("\n", parts).toLowerCase(Locale.ROOT);
    }

    private boolean matchFilter(Map<String, Object> row, Map<String, Object> filter) {
        Object fieldValue = filter.get("field");
        if (!(fieldValue instanceof String) || !row.containsKey(fieldValue)) {
            return true;
        }
        String field = (String) fieldValue;
        String start = filter.get("start") instanceof String ? (String) filter.get("start") : null;
        String end = filter.get("end") instanceof String ? (String) filter.get("end") : null;
        if ((start != null && !start.isBlank()) || (end != null && !end.isBlank())) {
            Long current = parseTime(String.valueOf(row.get(field)));
            if (current == null) {
                return false;
            }
            Long startTime = parseTime(start);
            Long endTime = parseTime(end);
            if (startTime != null && current < startTime) {
                return false;
            }
            return endTime == null || current <= endTime;
        }
        List<String> values = readValues(filter.get("values"));
        if (values.isEmpty()) {
            return true;
        }
        String current = String.valueOf(row.get(field)).trim().toLowerCase(Locale.ROOT);
        if (FUZZY_FIELDS.contains(field)) {
            return values.stream().anyMatch(value -> current.contains(value.toLowerCase(Locale.ROOT)));
        }
        return values.stream().anyMatch(value -> current.equals(value.toLowerCase(Locale.ROOT)));
    }

    private List<String> readValues(Object raw) {
        List<String> values = new ArrayList<>();
        if (raw instanceof List) {
            for (Object item : (List<?>) raw) {
                if (item != null && !String.valueOf(item).isBlank()) {
                    values.add(String.valueOf(item).trim());
                }
            }
        }
        return values;
    }

    private Long parseTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String text = value.trim().replace('/', '-');
        try {
            return LocalDateTime.parse(text, DATE_TIME_FORMATTER)
                    .atZone(java.time.ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli();
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private Map<String, Object> buildFilters() {
        Map<String, Set<String>> grouped = new LinkedHashMap<>();
        for (String field : FILTER_FIELDS) {
            grouped.put(field, new TreeSet<>());
        }
        String min = null;
        String max = null;
        for (Map<String, Object> row : taskList) {
            for (String field : FILTER_FIELDS) {
                Object value = row.get(field);
                if (value != null) {
                    grouped.get(field).add(String.valueOf(value));
                }
            }
            String createTime = String.valueOf(row.get("createTime"));
            if (min == null || createTime.compareTo(min) < 0) {
                min = createTime;
            }
            if (max == null || createTime.compareTo(max) > 0) {
                max = createTime;
            }
        }
        Map<String, Object> filters = new LinkedHashMap<>();
        for (String field : FILTER_FIELDS) {
            filters.put(field, new ArrayList<>(grouped.get(field)));
        }
        Map<String, String> createTime = new HashMap<>();
        createTime.put("min", min == null ? "" : min);
        createTime.put("max", max == null ? "" : max);
        filters.put("createTime", createTime);
        return filters;
    }
}
