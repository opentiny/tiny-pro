package com.TinyPro.mock;

import com.TinyPro.mock.ApiResponse;

import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/mock/api/user")
public class UserDataController {

    private final Map<String, Object> initData = initMockData();

    @PostMapping("/data")
    public ApiResponse<Map<String, Object>> getUserData(@RequestBody Map<String, Object> params) {
        Map<String, Object> response = deepCopyMockData(initData);

        List<Map<String, Object>> tableData = (List<Map<String, Object>>) response.get("tableData");

        List<Map<String, Object>> chartList = (List<Map<String, Object>>) ((List<Map<String, Object>>) response.get("chartData")).get(0).get("list");

        String sort = params.getOrDefault("sort", "").toString();
        String startTime = (String) params.getOrDefault("startTime", "");
        String endTime = (String) params.getOrDefault("endTime", "");
        List<String> filterStatus = (List<String>) params.getOrDefault("filterStatus", Collections.emptyList());
        List<String> filterType = (List<String>) params.getOrDefault("filterType", Collections.emptyList());
        // 1. sort 逻辑：1或3 -> 正序（这里不做操作，假设正序就是原序），2或4 -> 倒序
        if ("2".equals(sort) || "4".equals(sort)) {
            reverseList(tableData);
            reverseList(chartList);
        }
        if (hasFilterCriteria(startTime, endTime, filterStatus, filterType)) {
            List<Map<String, Object>> filteredTable = filterTableData(tableData, startTime, endTime, filterStatus, filterType);
            response.put("tableData", filteredTable);
            List<Map<String, Object>> filteredChart = filterChartList(chartList, filterType, filterStatus);
            List<Map<String, Object>> chartDataList = (List<Map<String, Object>>) response.get("chartData");
            if (!chartDataList.isEmpty()) {
                chartDataList.get(0).put("list", filteredChart);
            }
        }

        return ApiResponse.success(response);
    }

    private Map<String, Object> initMockData() {
        Map<String, Object> data = new HashMap<>();
        List<Map<String, Object>> tableData = new ArrayList<>();
        tableData.add(createTableItem("1", "A", "D", "GFD Company", "2021-12-18", "userInfo.type.optionA", "userInfo.status.optionD"));
        tableData.add(createTableItem("2", "B", "A", "WWWW Company", "2021-11-18", "userInfo.type.optionB", "userInfo.status.optionA"));
        tableData.add(createTableItem("3", "C", "B", "TGBYX Company", "2021-10-18", "userInfo.type.optionC", "userInfo.status.optionB"));
        tableData.add(createTableItem("4", "B", "D", "GF Company", "2021-09-18", "userInfo.type.optionB", "userInfo.status.optionC"));
        tableData.add(createTableItem("5", "C", "C", "Property management company", "2021-07-18", "userInfo.type.optionA", "userInfo.status.optionD"));
        tableData.add(createTableItem("6", "A", "C", "Property management company", "2020-12-23", "userInfo.type.optionA", "userInfo.status.optionC"));
        tableData.add(createTableItem("7", "B", "C", "GF Company", "2020-11-08", "userInfo.type.optionB", "userInfo.status.optionC"));
        tableData.add(createTableItem("8", "B", "C", "WWWW Company", "2020-10-18", "userInfo.type.optionB", "userInfo.status.optionC"));
        tableData.add(createTableItem("9", "C", "D", "WWWW Company", "2020-10-11", "userInfo.type.optionC", "userInfo.status.optionD"));
        tableData.add(createTableItem("10", "C", "D", "TGBYX Company", "2020-06-18", "userInfo.type.optionC", "userInfo.status.optionD"));
        data.put("tableData", tableData);

        List<Map<String, Object>> chartDataList = new ArrayList<>();
        Map<String, Object> chartItemWrapper = new HashMap<>();
        chartItemWrapper.put("title", "userInfo.week.1");
        chartItemWrapper.put("value", 1);

        List<Map<String, Object>> chartItemList = new ArrayList<>();
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionA", 1, "A", "A");
        addChartItem(chartItemList, "userInfo.type.optionC", "userInfo.status.optionB", 5, "c", "B");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionC", 3, "A", "C");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionA", 1, "A", "A");
        addChartItem(chartItemList, "userInfo.type.optionB", "userInfo.status.optionA", 6, "B", "A");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionC", 1, "A", "C");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionA", 1, "A", "A");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionB", 1, "A", "B");
        addChartItem(chartItemList, "userInfo.type.optionB", "userInfo.status.optionA", 1, "B", "A");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionC", 1, "A", "C");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionD", 1, "A", "D");
        addChartItem(chartItemList, "userInfo.type.optionC", "userInfo.status.optionD", 1, "C", "D");
        addChartItem(chartItemList, "userInfo.type.optionA", "userInfo.status.optionD", 1, "A", "D");

        chartItemWrapper.put("list", chartItemList);
        chartDataList.add(chartItemWrapper);

        for (int i = 1; i <= 17; i++) {
            Map<String, Object> monthItem = new HashMap<>();
            if (i == 1) continue;
            monthItem.put("title", "userInfo.month." + i);
            monthItem.put("value", 0);
            chartDataList.add(monthItem);
        }

        data.put("chartData", chartDataList);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", "10000");
        userInfo.put("username", "admin");
        userInfo.put("department", "Tiny-Vue-Pro");
        userInfo.put("employeeType", "social recruitment");
        userInfo.put("role", "admin");
        userInfo.put("job", "Front end");
        userInfo.put("probationStart", "2021-04-19");
        userInfo.put("probationEnd", "2021-10-15");
        userInfo.put("probationDuration", "180");
        userInfo.put("protocolStart", "2021-04-19");
        userInfo.put("protocolEnd", "2024-04-19");
        userInfo.put("address", "xian");
        userInfo.put("status", "normal");
        data.put("userInfo", userInfo);

        return data;
    }

    private Map<String, Object> createTableItem(String id, String bid, String pid, String name, String time, String type, String status) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("bid", bid);
        item.put("pid", pid);
        item.put("name", name);
        item.put("time", time);
        item.put("type", type);
        item.put("status", status);
        return item;
    }

    private void addChartItem(List<Map<String, Object>> list, String type, String status, int len, String bid, String pid) {
        Map<String, Object> item = new HashMap<>();
        item.put("type", type);
        item.put("status", status);
        item.put("len", len);
        item.put("bid", bid);
        item.put("pid", pid);
        list.add(item);
    }

    private Map<String, Object> deepCopyMockData(Map<String, Object> original) {
        return initMockData();
    }

    private boolean hasFilterCriteria(String startTime, String endTime, List<String> filterStatus, List<String> filterType) {
        return !startTime.isEmpty() || !endTime.isEmpty() || !filterStatus.isEmpty() || !filterType.isEmpty();
    }

    private void reverseList(List<Map<String, Object>> list) {
        int n = list.size();
        for (int i = 0; i < n / 2; i++) {
            Map<String, Object> tmp = list.get(i);
            list.set(i, list.get(n - 1 - i));
            list.set(n - 1 - i, tmp);
        }
    }

    private List<Map<String, Object>> filterTableData(List<Map<String, Object>> tableData, String startTime, String endTime, List<String> filterStatus, List<String> filterType) {
        List<Map<String, Object>> filtered = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        long start = 0, end = 0;
        try {
            if (!startTime.isEmpty()) start = sdf.parse(startTime).getTime();
            if (!endTime.isEmpty()) end = sdf.parse(endTime).getTime();
        } catch (ParseException ignored) {
        }

        for (Map<String, Object> item : tableData) {
            boolean pass = true;
            if (!filterType.isEmpty() && !filterType.contains(item.get("bid"))) {
                pass = false;
            }
            if (!filterStatus.isEmpty() && !filterStatus.contains(item.get("pid"))) {
                pass = false;
            }
            if (!startTime.isEmpty() || !endTime.isEmpty()) {
                try {
                    String timeStr = (String) item.get("time");
                    long itemTime = sdf.parse(timeStr).getTime();
                    if (!startTime.isEmpty() && itemTime < start) pass = false;
                    if (!endTime.isEmpty() && itemTime > end) pass = false;
                } catch (ParseException ignored) {
                    pass = false;
                }
            }

            if (pass) filtered.add(item);
        }
        return filtered;
    }

    private List<Map<String, Object>> filterChartList(List<Map<String, Object>> chartList, List<String> filterType, List<String> filterStatus) {
        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> item : chartList) {
            boolean pass = true;
            if (!filterType.isEmpty() && !filterType.contains(item.get("bid"))) {
                pass = false;
            }
            if (!filterStatus.isEmpty() && !filterStatus.contains(item.get("pid"))) {
                pass = false;
            }
            if (pass) filtered.add(item);
        }
        return filtered;
    }
}