package com.TinyPro.mock;

import com.TinyPro.mock.entity.EmployeeDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/mock/api")
public class MockEmployeeService {

    // 模拟员工数据列表
    private static final List<Map<String, Object>> employeeList = new ArrayList<>();

    static {
        for (int i = 0; i < 60; i++) {
            final int index = i; // 创建final变量供内部类使用
            employeeList.add(new HashMap<String, Object>() {{
                put("id", UUID.randomUUID().toString());
                put("name", "xiaoming");
                put("rank", "初级");
                put("description", "一段描述文字");
                put("createTime", new Date());
                put("status", String.valueOf(index % 3)); // 使用final变量
                put("type", "Tiny Design");
                put("roles", "前端");
                put("employeeNo", String.format("%08d", 22456 + index)); // 使用final变量
                put("department", "公共服务");
                put("departmentLevel", "中级");
                put("workbenchName", "work");
                put("project", "TinyDesign");
                put("address", "西安研究所");
                put("lastUpdateUser", "张三");
            }});
        }
    }

    @PostMapping("/employee/getEmployee")
    public ResponseEntity<Map<String, Object>> getEmployee(@RequestBody EmployeeDto employeeDto) {
        int pageIndex =employeeDto.getPageIndex() == null ? 1 : employeeDto.getPageIndex();
        int pageSize = employeeDto.getPageSize() == null ? 10 : employeeDto.getPageSize();

        // 计算分页
        int fromIndex = (pageIndex - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, employeeList.size());
        List<Map<String, Object>> pageData = employeeList.subList(fromIndex, toIndex);

        // 构建响应数据
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("total", employeeList.size());
        responseData.put("data", pageData);

        return ResponseEntity.ok(successResponseWrap(responseData));
    }

    private Map<String, Object> successResponseWrap(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("errMsg", "");
        response.put("code", "0");
        return response;
    }
}
