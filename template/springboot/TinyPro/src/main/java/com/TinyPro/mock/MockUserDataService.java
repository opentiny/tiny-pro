package com.TinyPro.mock;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;

@RestController
@RequestMapping("/mock/api/user")
public class MockUserDataService {

    // 原始数据副本
    private static List<Map<String, Object>> positiveTableData;
    private static List<Map<String, Object>> negativeTableData;
    private static List<Map<String, Object>> initList;
    private static Map<String, Object> userInfo;

    // 当前数据状态
    private static Map<String, Object> currentData = new HashMap<>();
    private static List<Map<String, Object>> chartData;

    static {
        // 初始化数据
        initializeMockData();

        // 设置初始状态
        resetData();
    }

    private static void initializeMockData() {
        // 初始化tableData
        positiveTableData = new ArrayList<>();
        // 添加示例数据...
        positiveTableData.add(new HashMap<String, Object>() {{
            put("id", "1");
            put("bid", "A");
            put("pid", "D");
            put("name", "GFD Company");
            put("time", "2021-12-18");
            put("type", "userInfo.type.optionA");
            put("status", "userInfo.status.optionD");
        }});

        // 创建反向副本
        negativeTableData = new ArrayList<>(positiveTableData);
        Collections.reverse(negativeTableData);

        // 初始化chartData
        chartData = new ArrayList<>();
        Map<String, Object> firstChartItem = new HashMap<>();
        firstChartItem.put("title", "userInfo.week.1");
        firstChartItem.put("value", 1);

        // 初始化list
        initList = new ArrayList<>();
        initList.add(new HashMap<String, Object>() {{
            put("type", "userInfo.type.optionA");
            put("status", "userInfo.status.optionA");
            put("len", 1);
            put("bid", "A");
            put("pid", "A");
        }});
        // 添加更多list项...

        firstChartItem.put("list", initList);
        chartData.add(firstChartItem);

        // 初始化userInfo
        userInfo = new HashMap<>();
        userInfo.put("userId", "10000");
        userInfo.put("username", "admin");
        // 添加更多userInfo属性...

        // 设置currentData
        currentData.put("tableData", new ArrayList<>(positiveTableData));
        currentData.put("chartData", new ArrayList<>(chartData));
        currentData.put("userInfo", new HashMap<>(userInfo));
    }

    private static void resetData() {
        // 重置tableData
        currentData.put("tableData", new ArrayList<>(positiveTableData));

        // 重置chartData
        List<Map<String, Object>> currentChartData = (List<Map<String, Object>>) currentData.get("chartData");
        if (!currentChartData.isEmpty()) {
            Map<String, Object> firstChartItem = currentChartData.get(0);
            firstChartItem.put("list", new ArrayList<>(initList));
        }
    }

    @PostMapping("/data")
    public ResponseEntity<Map<String, Object>> getUserData(@RequestBody Map<String, Object> params) {
        Integer sort = params.get("sort") != null ? Integer.parseInt(params.get("sort").toString()) : null;
        String startTime = params.get("startTime") != null ? params.get("startTime").toString() : "";
        String endTime = params.get("endTime") != null ? params.get("endTime").toString() : "";

        @SuppressWarnings("unchecked")
        List<String> filterStatus = params.get("filterStatus") != null ?
                (List<String>) params.get("filterStatus") : Collections.emptyList();

        @SuppressWarnings("unchecked")
        List<String> filterType = params.get("filterType") != null ?
                (List<String>) params.get("filterType") : Collections.emptyList();

        // 重置数据
        resetData();

        // 处理排序
        if (sort != null) {
            // 获取chartData的第一个元素的list
            List<Map<String, Object>> currentChartData = (List<Map<String, Object>>) currentData.get("chartData");
            if (!currentChartData.isEmpty()) {
                Map<String, Object> firstChartItem = currentChartData.get(0);
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> chartList = (List<Map<String, Object>>) firstChartItem.get("list");

                if (chartList != null) {
                    Collections.reverse(chartList);
                }
            }

            if (sort == 2 || sort == 4) {
                currentData.put("tableData", new ArrayList<>(negativeTableData));
            } else {
                currentData.put("tableData", new ArrayList<>(positiveTableData));
            }

            return ResponseEntity.ok(successResponseWrap(currentData));
        }

        // 处理过滤
        if (!startTime.isEmpty() || !endTime.isEmpty() || !filterStatus.isEmpty() || !filterType.isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                long start = !startTime.isEmpty() ? sdf.parse(startTime).getTime() : Long.MIN_VALUE;
                long end = !endTime.isEmpty() ? sdf.parse(endTime).getTime() : Long.MAX_VALUE;

                // 过滤tableData
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> originalTableData = (List<Map<String, Object>>) currentData.get("tableData");
                List<Map<String, Object>> filteredTable = new ArrayList<>();

                for (Map<String, Object> item : originalTableData) {
                    String itemTime = item.get("time").toString();
                    String bid = item.get("bid").toString();
                    String pid = item.get("pid").toString();

                    long itemTimeMillis = sdf.parse(itemTime).getTime();

                    if ((filterType.isEmpty() || filterType.contains(bid)) &&
                            (filterStatus.isEmpty() || filterStatus.contains(pid)) &&
                            itemTimeMillis >= start && itemTimeMillis <= end) {
                        filteredTable.add(item);
                    }
                }
                currentData.put("tableData", filteredTable);

                // 过滤chartData
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> currentChartData = (List<Map<String, Object>>) currentData.get("chartData");
                if (!currentChartData.isEmpty()) {
                    Map<String, Object> firstChartItem = currentChartData.get(0);
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> chartList = (List<Map<String, Object>>) firstChartItem.get("list");

                    if (chartList != null) {
                        List<Map<String, Object>> filteredChart = new ArrayList<>();
                        for (Map<String, Object> item : chartList) {
                            String bid = item.get("bid").toString();
                            String pid = item.get("pid").toString();

                            if ((filterType.isEmpty() || filterType.contains(bid)) &&
                                    (filterStatus.isEmpty() || filterStatus.contains(pid))) {
                                filteredChart.add(item);
                            }
                        }
                        firstChartItem.put("list", filteredChart);
                    }
                }

                return ResponseEntity.ok(successResponseWrap(currentData));
            } catch (ParseException e) {
                throw new RuntimeException("日期解析错误", e);
            }
        }

        return ResponseEntity.ok(successResponseWrap(currentData));
    }

    private Map<String, Object> successResponseWrap(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");
        return response;
    }
}