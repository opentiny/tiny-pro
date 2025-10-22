package com.TinyPro.mock;

import com.TinyPro.mock.ApiResponse;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/mock")
public class MockprofileController {

    private final Map<String, Object> initData = createMockInitData();

    private Map<String, Object> createMockInitData() {
        List<String> projectList = Arrays.asList(
                "baseForm.form.label.projectone",
                "baseForm.form.label.projecttwo",
                "baseForm.form.label.projectthree"
        );

        List<Map<String, String>> tableDataList = Arrays.asList(
                createRecord("1", "version1", "offline", "person1", "2022-10-11"),
                createRecord("2", "version2", "offline", "person2", "2022-10-12"),
                createRecord("3", "version3", "online", "person3", "2022-10-13"),
                createRecord("4", "version4", "online", "person4", "2022-10-14"),
                createRecord("5", "version5", "online", "person5", "2022-10-15"),
                createRecord("6", "version6", "online", "person6", "2022-10-16")
        );

        Map<String, Object> data = new HashMap<>();
        data.put("Project", projectList);
        data.put("tableData", tableDataList);

        return data;
    }

    // 辅助方法：构造单条 tableData 记录
    private Map<String, String> createRecord(String id, String version, String operation, String updated, String time) {
        Map<String, String> record = new HashMap<>();
        record.put("id", id);
        record.put("version", version);
        record.put("operation", operation);
        record.put("updated", updated);
        record.put("time", time);
        return record;
    }


    @GetMapping("/api/detail/getdata")
    public ApiResponse<Map<String, Object>> getDetailData() {
        return ApiResponse.success(initData, "获取详情数据成功", 20000);
    }
}