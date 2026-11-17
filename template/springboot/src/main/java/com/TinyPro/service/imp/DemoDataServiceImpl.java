package com.TinyPro.service.imp;

import com.TinyPro.service.DemoDataService;
import com.TinyPro.service.FormDemoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DemoDataServiceImpl implements DemoDataService {

    private final FormDemoService formDemoService;

    public DemoDataServiceImpl(FormDemoService formDemoService) {
        this.formDemoService = formDemoService;
    }

    @Override
    public Map<String, Object> getBoardHome() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("cards", Map.of(
                "week", cardList(new String[]{"4.18", "1.92", "3.44", "0.81"},
                        new String[]{"up", "down", "up", "down"}),
                "day", cardList(new String[]{"3.76", "1.68", "3.08", "0.66"},
                        new String[]{"up", "up", "down", "up"}),
                "hour", cardList(new String[]{"2.95", "1.21", "3.37", "0.58"},
                        new String[]{"down", "down", "up", "up"})
        ));
        result.put("curve", Map.of(
                "pv", List.of(12, 14, 15, 18, 21, 24, 23, 20, 19, 22, 26, 29, 31, 30, 27, 25, 23, 24, 26, 28, 30, 29, 25, 22),
                "play", List.of(18, 17, 19, 21, 23, 25, 27, 26, 24, 23, 25, 28, 30, 32, 31, 29, 27, 26, 28, 29, 31, 30, 28, 26),
                "page", List.of(24, 26, 28, 27, 25, 24, 26, 29, 31, 33, 35, 34, 32, 30, 29, 31, 33, 34, 32, 30, 28, 27, 29, 30)
        ));
        result.put("falls", Map.of(
                "pv", List.of(11, 16, 20, 24, 15, 28),
                "play", List.of(15, 25, 13, 21, 29, 18),
                "page", List.of(23, 18, 30, 26, 21, 32)
        ));
        result.put("round", Map.of(
                "ring", List.of(
                        Map.of("value", 426, "name", "5G"),
                        Map.of("value", 913, "name", "4G"),
                        Map.of("value", 268, "name", "home.round.unknow"),
                        Map.of("value", 347, "name", "3G")
                ),
                "stations", List.of(
                        Map.of("key", "home.round.station1", "percentage", 78, "color", "#5cb87a"),
                        Map.of("key", "home.round.station2", "percentage", 63, "color", "#1989fa"),
                        Map.of("key", "home.round.station3", "percentage", 91, "color", "#e6a23c"),
                        Map.of("key", "home.round.station4", "percentage", 46, "color", "#f56c6c")
                )
        ));
        result.put("region", List.of(
                Map.of("name", "北京市", "value", 286400),
                Map.of("name", "天津市", "value", 86500),
                Map.of("name", "上海市", "value", 325800),
                Map.of("name", "重庆市", "value", 105600),
                Map.of("name", "河北省", "value", 46300),
                Map.of("name", "河南省", "value", 52700),
                Map.of("name", "辽宁省", "value", 31800),
                Map.of("name", "山东省", "value", 71820),
                Map.of("name", "江苏省", "value", 96850),
                Map.of("name", "浙江省", "value", 88420),
                Map.of("name", "湖北省", "value", 57430),
                Map.of("name", "广东省", "value", 132680),
                Map.of("name", "四川省", "value", 69320),
                Map.of("name", "陕西省", "value", 43870)
        ));
        result.put("regionTable", List.of(
                Map.of("id", "DB-1", "space", "深圳", "pv", "2136(42.18%)", "play", "0.38s", "page", "1.9s"),
                Map.of("id", "DB-2", "space", "杭州", "pv", "1482(29.25%)", "play", "0.41s", "page", "2.1s"),
                Map.of("id", "DB-3", "space", "北京", "pv", "716(14.14%)", "play", "0.47s", "page", "2.4s"),
                Map.of("id", "DB-4", "space", "成都", "pv", "421(8.31%)", "play", "0.52s", "page", "2.8s"),
                Map.of("id", "DB-5", "space", "南京", "pv", "310(6.12%)", "play", "0.49s", "page", "2.5s")
        ));
        return result;
    }

    @Override
    public Map<String, Object> getWorkPlan() {
        return Map.of("options", List.of(
                Map.of("value", "3", "label", "work.mock.Test"),
                Map.of("value", "1", "label", "work.mock.employees"),
                Map.of("value", "2", "label", "work.mock.onboard")
        ));
    }

    @Override
    public Map<String, Object> getWorkPractice() {
        return Map.of("options", List.of(
                Map.of("value", "2", "label", "work.mock.week2"),
                Map.of("value", "3", "label", "work.mock.week3"),
                Map.of("value", "1", "label", "work.mock.week1")
        ));
    }

    @Override
    public Map<String, Object> getWorkTraining() {
        return Map.of("options", List.of(
                Map.of("value", "work.mock.collectValue2", "description", "work.mock.collectDescription2", "label1", "work.mock.collectHotLabel1", "label2", "work.mock.collectLabel3"),
                Map.of("value", "work.mock.collectValue4", "description", "work.mock.collectDescription4", "label1", "work.mock.collectHotLabel1", "label2", "work.mock.collectLabel5", "isNews", true),
                Map.of("value", "work.mock.collectValue1", "description", "work.mock.collectDescription1", "label1", "work.mock.collectHotLabel1", "label2", "work.mock.collectLabel2"),
                Map.of("value", "work.mock.collectValue3", "description", "work.mock.collectDescription3", "label1", "work.mock.collectHotLabel1", "label2", "work.mock.collectLabel4")
        ));
    }

    @Override
    public List<Integer> getWorkPracticeChart(Map<String, Object> body) {
        String selected = body == null ? "" : String.valueOf(body.getOrDefault("value", ""));
        return switch (selected) {
            case "1" -> List.of(136, 248, 391, 520);
            case "2" -> List.of(418, 675, 892, 1280);
            default -> List.of(9860, 420, 1268, 305);
        };
    }

    @Override
    public Map<String, Object> getUserCenterData(Map<String, Object> query) {
        List<Map<String, Object>> source = userCenterRows();
        Map<String, Object> params = query == null ? Map.of() : query;
        String startTime = stringValue(params.get("startTime"));
        String endTime = stringValue(params.get("endTime"));
        List<String> filterStatus = stringList(params.get("filterStatus"));
        List<String> filterType = stringList(params.get("filterType"));

        List<Map<String, Object>> tableData = source.stream()
                .filter(row -> filterType.isEmpty() || filterType.contains(lastChar(row.get("type"))))
                .filter(row -> filterStatus.isEmpty() || filterStatus.contains(lastChar(row.get("status"))))
                .filter(row -> startTime.isBlank() || stringValue(row.get("time")).compareTo(startTime) >= 0)
                .filter(row -> endTime.isBlank() || stringValue(row.get("time")).compareTo(endTime) <= 0)
                .map(HashMap::new)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

        String sort = stringValue(params.get("sort"));
        tableData.sort((left, right) -> {
            int result = stringValue(left.get("time")).compareTo(stringValue(right.get("time")));
            return "2".equals(sort) || "4".equals(sort) ? -result : result;
        });

        List<Map<String, Object>> chartData = List.of(Map.of(
                "title", "userInfo.week.1",
                "value", 1,
                "list", tableData.stream().map(row -> Map.of(
                        "sort", Integer.parseInt(stringValue(row.get("id"))),
                        "bid", row.get("bid"),
                        "type", row.get("type"),
                        "status", row.get("status"),
                        "len", 1,
                        "pid", row.get("pid")
                )).toList()
        ));
        List<Map<String, Object>> taskSummary = List.of("A", "B", "C", "D").stream()
                .map(status -> Map.<String, Object>of("status", status, "value", (int) tableData.stream()
                        .filter(row -> status.equals(lastChar(row.get("status")))).count()))
                .toList();

        return Map.of("chartData", chartData, "tableData", tableData, "taskSummary", taskSummary);
    }

    @Override
    public Map<String, Object> getBaseForm() {
        return formDemoService.getFormData();
    }

    @Override
    public Map<String, Object> getStepForm() {
        return formDemoService.getFormData();
    }

    @Override
    public Map<String, Object> getAdvanceForm() {
        return formDemoService.getFormData();
    }

    @Override
    public Map<String, Object> getProfileDetail() {
        return Map.of(
                "Project", List.of("baseForm.form.label.projectthree", "baseForm.form.label.projectone", "baseForm.form.label.projecttwo"),
                "tableData", List.of(
                        Map.of("id", "REL-DB-001", "version", "v3.6.0", "operation", "online", "updated", "周明轩", "time", "2026-10-28"),
                        Map.of("id", "REL-DB-002", "version", "v3.5.2", "operation", "offline", "updated", "黄志强", "time", "2026-10-21"),
                        Map.of("id", "REL-DB-003", "version", "v3.5.1", "operation", "online", "updated", "林佳怡", "time", "2026-10-15"),
                        Map.of("id", "REL-DB-004", "version", "v3.5.0", "operation", "online", "updated", "苏婉清", "time", "2026-10-09"),
                        Map.of("id", "REL-DB-005", "version", "v3.4.0", "operation", "offline", "updated", "何宇辰", "time", "2026-09-26")
                )
        );
    }

    @Override
    @Transactional
    public void saveSubmission(Map<String, Object> payload) {
        // Keep the same successful demo contract as NestJS. Persistence can be
        // added later when a form submission table is introduced.
    }

    private List<Map<String, Object>> cardList(String[] values, String[] trends) {
        List<Map<String, Object>> cards = new ArrayList<>();
        for (int i = 0; i < values.length; i++) {
            cards.add(Map.of(
                    "value", values[i],
                    "trend", trends[i],
                    "change", "1.6%",
                    "type", "up".equals(trends[i]) ? "success" : "danger",
                    "percent", 57 + i * 8
            ));
        }
        return cards;
    }

    private List<Map<String, Object>> userCenterRows() {
        return List.of(
                userRow("1", "A", "B", "完成云平台数据库联调", "2026-11-02 09:30:00", "userInfo.type.optionA", "userInfo.status.optionB"),
                userRow("2", "B", "A", "验收监控页性能指标", "2026-11-04 11:20:00", "userInfo.type.optionB", "userInfo.status.optionA"),
                userRow("3", "C", "C", "补充质量网关自动化用例", "2026-11-06 14:10:00", "userInfo.type.optionC", "userInfo.status.optionC"),
                userRow("4", "A", "D", "整理企业工作台发布记录", "2026-11-08 16:40:00", "userInfo.type.optionA", "userInfo.status.optionD"),
                userRow("5", "B", "B", "评审设计资产中心交互稿", "2026-11-10 10:25:00", "userInfo.type.optionB", "userInfo.status.optionB"),
                userRow("6", "C", "A", "完成项目列表持久化验证", "2026-11-12 17:15:00", "userInfo.type.optionC", "userInfo.status.optionA")
        );
    }

    private Map<String, Object> userRow(String id, String bid, String pid, String name,
                                        String time, String type, String status) {
        return Map.of("id", id, "bid", bid, "pid", pid, "name", name,
                "time", time, "type", type, "status", status);
    }

    private List<String> stringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String lastChar(Object value) {
        String text = stringValue(value);
        return text.isEmpty() ? "" : text.substring(text.length() - 1);
    }
}
