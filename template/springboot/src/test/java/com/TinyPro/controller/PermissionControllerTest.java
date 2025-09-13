package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.vo.PermissionVo;
import com.TinyPro.service.IPermissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PermissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IPermissionService iPermissionService;

    private PermissionVo mockPermissionVo;
    private PermissionVo updatePermissionVo;
    private Permission mockPermission;
    private List<Permission> mockPermissionList;

    @BeforeEach
    public void setUp() {
        // 模拟一个 PermissionVo（用于返回创建/更新后的权限视图）
        mockPermissionVo = new PermissionVo();
        mockPermissionVo.setId(1);
        mockPermissionVo.setName("user:create");
        mockPermissionVo.setDesc("用户添加");

        updatePermissionVo = new PermissionVo();
        updatePermissionVo.setId(1);
        updatePermissionVo.setName("user:update");
        updatePermissionVo.setDesc("用户添加");
        // 模拟一个 Permission（用于删除或返回单个对象）
        mockPermission = new Permission();
        mockPermission.setId(1);
        mockPermission.setName("user:create");
        mockPermission.setDesc("用户添加");

        Permission permission1 = new Permission();
        permission1.setId(1);
        permission1.setName("user:create");
        permission1.setDesc("用户添加");

        Permission permission2 = new Permission();
        permission2.setDesc("用户读取");
        permission2.setId(2);
        permission2.setName("user:read");

        // 模拟返回的权限列表（用于不分页查询）
        mockPermissionList = Arrays.asList(
                permission1,
                permission2
        );
    }

    // ===================== testCreatePermission =====================
    @Test
    public void testCreatePermission() throws Exception {
        when(iPermissionService.create(any(), anyBoolean()))
                .thenReturn(ResponseEntity.ok(mockPermissionVo));

        mockMvc.perform(post("/permission")
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "user:create",
                                  "desc": "user:create"
                                }
                                """)
                        .header("Authorization", Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("user:create"))
                .andExpect(jsonPath("$.desc").value("用户添加"));
    }

    // ===================== testUpdatePermission =====================
    @Test
    public void testUpdatePermission() throws Exception {
        when(iPermissionService.updatePermission(any()))
                .thenReturn(ResponseEntity.ok(updatePermissionVo));

        mockMvc.perform(patch("/permission")
                        .contentType("application/json")
                        .content("""
                                {
                                  "id": 1,
                                  "name": "user:update",
                                  "desc": "用户添加"
                                }
                                """)
                        .header("Authorization", Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("user:update"))
                .andExpect(jsonPath("$.desc").value("用户添加"));
    }

    // ===================== testFindPermissions_WithoutPagination =====================
    @Test
    public void testFindPermissions_WithoutPagination() throws Exception {
        when(iPermissionService.findAllPermission())
                .thenReturn(mockPermissionList);

        mockMvc.perform(get("/permission")
                        .header("Authorization", Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("user:create"))
                .andExpect(jsonPath("$[1].name").value("user:read"));
    }

    // ===================== testFindPermissions_WithPagination =====================
    @Test
    public void testFindPermissions_WithPagination() throws Exception {
        // 假如你的 IPermissionService.findPermissions(page, limit, name) 返回的是 ResponseEntity<PageWrapper> 或 List
        // 这里假设返回的是 List（根据你的代码逻辑）
        List<Permission> pagedPermissions = Collections.singletonList(mockPermission);

        when(iPermissionService.findPermissions(anyInt(), anyInt(), anyString()))
                .thenAnswer(item -> ResponseEntity.ok(pagedPermissions));

        mockMvc.perform(get("/permission")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("name", "user")
                        .header("Authorization", Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("user:create"));
    }

    // ===================== testDeletePermission =====================
    @Test
    public void testDeletePermission() throws Exception {
        when(iPermissionService.delPermission(anyInt()))
                .thenAnswer(item ->ResponseEntity.ok(mockPermission));

        mockMvc.perform(delete("/permission/1")
                        .header("Authorization", Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("user:create"))
                .andExpect(jsonPath("$.desc").value("用户添加"));
    }
}