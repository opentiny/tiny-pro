package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.*;
import com.TinyPro.entity.page.Meta;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.entity.vo.UserVo;
import com.TinyPro.service.IUserService;
import com.TinyPro.utils.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IUserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        this.mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    // ==================== POST /user/reg 【用户注册】====================
    @Test
    void testRegister() throws Exception {
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("register@example.com");
        dto.setName("Test Register");
        dto.setPassword("123456");
        UserVo vo = new UserVo();
        vo.setEmail("register@example.com");
        vo.setName("Test Register");
        when(userService.create(any(CreateUserDto.class), anyBoolean()))
                .thenReturn(ResponseEntity.ok(vo));
        mockMvc.perform(post("/user/reg")
                        .contentType("application/json")
                        .header("Authorization", Contants.TOKEN)
                        .content("""
                                {
                                    "email": "register@example.com",
                                    "name": "Test Register",
                                    "password": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("register@example.com"))
                .andExpect(jsonPath("$.name").value("Test Register"));
    }

    // ==================== GET /user/info【获取用户信息】====================
    @Test
    void testGetUserInfo() throws Exception {
        Claims claims = mock(Claims.class);
        when(claims.get("email", String.class)).thenReturn("admin@no-reply.com");
        when(jwtUtil.parseJwt(anyString())).thenReturn(claims);

        User user = new User();
        user.setEmail("admin@no-reply.com");
        user.setName("Info User");

        when(userService.getUserInfo("admin@no-reply.com"))
                .thenReturn(new ResponseEntity<>(user, HttpStatus.OK));

        mockMvc.perform(get("/user/info")
                        .header("Authorization", Contants.TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@no-reply.com"))
                .andExpect(jsonPath("$.name").value("Info User"));
    }

    // ==================== DELETE /user/{email} 【删除用户】====================
    @Test
    void testDeleteUser() throws Exception {
        UserVo vo = new UserVo();
        vo.setEmail("delete@example.com");

        when(userService.removeUserInfo("delete@example.com"))
                .thenReturn(new ResponseEntity<>(vo, HttpStatus.OK));

        mockMvc.perform(delete("/user/delete@example.com")
                        . header("Authorization", Contants.TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("delete@example.com"));
    }

    @Test
    void testUpdateUser() throws Exception {
        UpdateUserDto dto = new UpdateUserDto()
                .setOldPassword("oldPassword123")
                .setNewPassword("newPassword456")
                .setEmail("update@example.com")
                .setRoleIds(List.of(1L, 2L))
                .setDepartment("研发部")
                .setEmployeeType("正式员工")
                .setProbationStart("2024-01-01")
                .setProbationEnd("2024-03-01")
                .setProbationDuration("2个月")
                .setProtocolStart("2024-01-01")
                .setProtocolEnd("2025-01-01")
                .setAddress("北京市海淀区某某街道1号")
                .setStatus(1)
                .setName("Updated Name");
        ObjectMapper objectMapper = new ObjectMapper();
        String requestBodyJson = objectMapper.writeValueAsString(dto);
        UserVo vo = new UserVo();
        vo.setId(1);
        vo.setName("张三");
        vo .setEmail("zhangsan@example.com");
        vo.setDepartment("技术部");
        vo.setEmployeeType("正式员工");
        vo.setProbationStart(LocalDate.of(2024, 1, 1));
        vo.setProbationEnd(LocalDate.of(2024, 3, 1));
        vo.setProbationDuration("2");
        vo.setProtocolStart(LocalDate.of(2024, 1, 1));
        vo.setProtocolEnd(LocalDate.of(2024, 12, 31));
        vo.setAddress("北京市海淀区中关村南大街5号");
        vo.setStatus(1);
        RoleSimpleVo roleSimpleVo1 = new RoleSimpleVo();
        roleSimpleVo1.setId(1);
        roleSimpleVo1.setName("管理员");
        RoleSimpleVo roleSimpleVo2 = new RoleSimpleVo();
        roleSimpleVo2.setId(2);
        roleSimpleVo2.setName("普通用户");
        vo.setRole(List.of(
                roleSimpleVo1,
                roleSimpleVo2
                ));

        when(userService.updateUserInfo(any(UpdateUserDto.class)))
                .thenReturn(new ResponseEntity<>(vo, HttpStatus.OK));

        mockMvc.perform(patch("/user/update")
                        .contentType("application/json")
                        .header("Authorization", Contants.TOKEN)
                        .content(requestBodyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.role").exists())
                .andExpect(jsonPath("$.department").exists())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    void testGetAllUser() throws Exception {
        // 1. 准备两个 UserVo 测试数据
        UserVo vo1 = new UserVo();
        vo1.setEmail("user1@example.com");

        UserVo vo2 = new UserVo();
        vo2.setEmail("user2@example.com");

        List<UserVo> userList = List.of(vo1, vo2);

        Meta meta = new Meta(
                2L,
                2,
                10,
                1,
                1
        );
        PageWrapper<UserVo> pageWrapper = new PageWrapper<>(userList,meta);

        when(userService.getAllUser(
                any(PaginationQueryDto.class),
                anyString(),
                any(),
                any()
        )).thenReturn(pageWrapper);

        // 5. 模拟请求：GET /user，带上查询参数
        mockMvc.perform(get("/user")
                        .param("name", "test")       // 可选查询参数
                        .param("role", "1")          // 可选角色ID
                        .param("email", "user@example.com")  // 可选邮箱筛选
                        .header("Authorization", Contants.TOKEN))  // 模拟鉴权头
                .andExpect(status().isOk())         // 期望 HTTP 200
                .andExpect(jsonPath("$.items.length()").value(2))     // ✅ 注意字段名是 data 还是 items
                .andExpect(jsonPath("$.items[0].email").value("user1@example.com"))
                .andExpect(jsonPath("$.items[1].email").value("user2@example.com"));
    }
    // ==================== PATCH /user/admin/updatePwd 【管理员改密码】====================
    @Test
    void testUpdatePwdAdmin() throws Exception {
        UpdatePwdAdminDto dto = new UpdatePwdAdminDto();
        dto.setEmail("adminpwd@example.com");
        dto.setNewPassword("newAdminPass123");

        when(userService.updatePwdAdmin(any(UpdatePwdAdminDto.class)))
                .thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(patch("/user/admin/updatePwd")
                        .contentType("application/json")
                        .header("Authorization", Contants.TOKEN)
                        .content("""
                                {
                                    "email": "adminpwd@example.com",
                                    "newPassword": "newAdminPass123"
                                }
                                """))
                .andExpect(status().isOk());
    }

    // ==================== PATCH /user/updatePwd 【用户自己改密码】====================
    @Test
    void testUpdatePwdUser() throws Exception {

        doNothing().when(userService).updatePwdUser(any(UpdatePwdUserDto.class));

        mockMvc.perform(patch("/user/updatePwd")
                        .contentType("application/json")
                        .header("Authorization", Contants.TOKEN)
                        .content("""
                                {
                                    "email": "admin@no-reply.com",
                                    "oldPassword": "old123",
                                    "newPassword": "new123"
                                }
                                """))
                .andDo(result -> System.out.println("Response: " + result.getResponse().getContentAsString()))
                .andExpect(status().isOk());
    }


    @Test
    void testBatchRemoveUser() throws Exception {
        List<String> emails = Arrays.asList("batch1@example.com", "batch2@example.com");

        when(userService.batchDeleteUser(anyList()))
                .thenAnswer(item ->ResponseEntity.ok(emails));

        mockMvc.perform(post("/user/batch")
                        .contentType("application/json")
                        .header("Authorization", Contants.TOKEN)
                        .content("""
                                ["batch1@example.com", "batch2@example.com"]
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists())
                .andExpect(jsonPath("$[1]").exists());
    }
}