package com.TinyPro.mock;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/mock/api")
public class MockBaseService {

    // 初始化基础数据
    private static final Map<String, Object> initBase = new HashMap<>() {{
        put("Project", Arrays.asList(
            "baseForm.form.label.projectone",
            "baseForm.form.label.projecttwo",
            "baseForm.form.label.projectthree"
        ));
        
        put("rank", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "1"); put("label", "01"); }},
            new HashMap<String, String>() {{ put("value", "2"); put("label", "02"); }},
            new HashMap<String, String>() {{ put("value", "3"); put("label", "03"); }},
            new HashMap<String, String>() {{ put("value", "4"); put("label", "04"); }},
            new HashMap<String, String>() {{ put("value", "5"); put("label", "05"); }}
        ));
        
        put("person", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "local"); put("label", "baseForm.form.label.personone"); }},
            new HashMap<String, String>() {{ put("value", "noemployees"); put("label", "baseForm.form.label.persontwo"); }},
            new HashMap<String, String>() {{ put("value", "chineseemployees"); put("label", "baseForm.form.label.personthree"); }}
        ));
        
        put("frequency", Arrays.asList(
            "baseForm.form.label.frequencyone",
            "baseForm.form.label.frequencytwo",
            "baseForm.form.label.frequencythree",
            "baseForm.form.label.frequencyfour"
        ));
    }};

    // 初始化步骤数据
    private static final Map<String, Object> initStep = new HashMap<>() {{
        put("position", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "1"); put("label", "position1"); }},
            new HashMap<String, String>() {{ put("value", "2"); put("label", "position2"); }},
            new HashMap<String, String>() {{ put("value", "3"); put("label", "position3"); }},
            new HashMap<String, String>() {{ put("value", "4"); put("label", "position4"); }}
        ));
        
        put("HR", Arrays.asList(
            new HashMap<String, String>() {{ put("value", "1"); put("label", "test01"); }},
            new HashMap<String, String>() {{ put("value", "2"); put("label", "test01"); }},
            new HashMap<String, String>() {{ put("value", "3"); put("label", "test03"); }}
        ));
        
        put("mentor", Arrays.asList("Teacher1", "Teacher2", "Teacher3", "Teacher4"));
        put("director", Arrays.asList("Director1", "Director2", "Director3", "Director4"));
    }};

    @GetMapping("/base/getdata")
    public ResponseEntity<Map<String, Object>> getBaseData() {
        return ResponseEntity.ok(successResponseWrap(initBase));
    }

    @GetMapping("/step/getdata")
    public ResponseEntity<Map<String, Object>> getStepData() {
        return ResponseEntity.ok(successResponseWrap(initStep));
    }

    @PostMapping("/channel-form/submit")
    public ResponseEntity<Map<String, Object>> submitForm() {
        return ResponseEntity.ok(successResponseWrap("ok"));
    }

    private Map<String, Object> successResponseWrap(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");
        return response;
    }
}
