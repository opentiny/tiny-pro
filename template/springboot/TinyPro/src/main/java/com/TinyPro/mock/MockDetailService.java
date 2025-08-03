package com.TinyPro.mock;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/mock/api/detail")
public class MockDetailService {

    // 模拟数据初始化
    private static final Map<String, Object> initData = new HashMap<>() {{
        put("Project", Arrays.asList(
            "baseForm.form.label.projectone",
            "baseForm.form.label.projecttwo",
            "baseForm.form.label.projectthree"
        ));
        
        put("tableData", Arrays.asList(
            new HashMap<String, String>() {{
                put("id", "1");
                put("version", "version1");
                put("operation", "offline");
                put("updated", "person1");
                put("time", "2022-10-11");
            }},
            new HashMap<String, String>() {{
                put("id", "2");
                put("version", "version2");
                put("operation", "offline");
                put("updated", "person2");
                put("time", "2022-10-12");
            }},
            new HashMap<String, String>() {{
                put("id", "3");
                put("version", "version3");
                put("operation", "online");
                put("updated", "person3");
                put("time", "2022-10-13");
            }},
            new HashMap<String, String>() {{
                put("id", "4");
                put("version", "version4");
                put("operation", "online");
                put("updated", "person4");
                put("time", "2022-10-14");
            }},
            new HashMap<String, String>() {{
                put("id", "5");
                put("version", "version5");
                put("operation", "online");
                put("updated", "person5");
                put("time", "2022-10-15");
            }},
            new HashMap<String, String>() {{
                put("id", "6");
                put("version", "version6");
                put("operation", "online");
                put("updated", "person6");
                put("time", "2022-10-16");
            }}
        ));
    }};

    @GetMapping("/getdata")
    public ResponseEntity<Map<String, Object>> getDetailData() {
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