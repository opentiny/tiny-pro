package com.TinyPro.controller;

import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.service.IAuthService;
import com.TinyPro.utils.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IAuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateAuthDto validLoginDto;
    private CreateAuthDto invalidLoginDto;
    private LogoutAuthDto validLogoutDto;
    private LogoutAuthDto invalidLogoutDto;

    private static final String LOGIN_ENDPOINT = "/auth/login";
    private static final String LOGOUT_ENDPOINT = "/auth/logout";

    @BeforeEach
    void setUp() {
        // 有效登录DTO
        validLoginDto = new CreateAuthDto();
        validLoginDto.setEmail("admin@no-reply.com");
        validLoginDto.setPassword("admin");

        // 无效登录DTO（缺少邮箱）
        invalidLoginDto = new CreateAuthDto();
        invalidLoginDto.setPassword("password123");

        // 有效登出DTO
        validLogoutDto = new LogoutAuthDto();
        validLogoutDto.setToken("eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFkbWluQG5vLXJlcGx5LmNvbSIsInN1YiI6ImFkbWluQG5vLXJlcGx5LmNvbSIsImlhdCI6MTc1NzQ3MTExMywiZXhwIjoxNzU3NDc4MzEzfQ.ZYUFVKNXsWM9eKIRx5hzUGYUnLgGjKh6-5NiZooUDrw");

        // 无效登出DTO（空token）
        invalidLogoutDto = new LogoutAuthDto();
        invalidLogoutDto.setToken("");

        // 模拟JWT解析
        Claims mockJwtClaims = Mockito.mock(Claims.class);
        when(mockJwtClaims.get("email", String.class)).thenReturn("admin@no-reply.com");
        when(jwtUtil.parseJwt(validLogoutDto.getToken())).thenReturn(mockJwtClaims);
        when(jwtUtil.parseJwt(invalidLogoutDto.getToken())).thenThrow(new IllegalArgumentException("无效的token"));
    }

    // 测试登录成功场景（关键修改：显式指定ResponseEntity<?>）
    @Test
    public void testLogin_Success() throws Exception {
        Map<String, String> successResponse = new HashMap<>();
        successResponse.put("token", "mocked-jwt-token");

        // 关键修改：通过ResponseEntity<?>强制泛型匹配
        when(authService.login(any(CreateAuthDto.class), any(HttpServletResponse.class)))
                .thenAnswer(invocation -> ResponseEntity.ok(successResponse));

        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        verify(authService, times(1)).login(any(CreateAuthDto.class), any(HttpServletResponse.class));
    }

    // 测试登录参数验证失败场景（无需修改）
    @Test
    public void testLogin_InvalidParameters() throws Exception {
        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLoginDto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        verify(authService, never()).login(any(CreateAuthDto.class), any(HttpServletResponse.class));
    }

    @Test
    public void testLogin_AuthenticationFailed() throws Exception {
        // 关键修改：显式声明泛型为?
        when(authService.login(any(CreateAuthDto.class), any(HttpServletResponse.class)))
                .thenAnswer(invalidLogin ->ResponseEntity.<ResponseEntity<?>>status(401).body(Map.of("message", "邮箱或密码错误")));

        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginDto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("邮箱或密码错误"));
    }

    // 登出成功场景（无需修改，因返回值是String，无泛型冲突）
    @Test
    public void testLogout_Success() throws Exception {
        Claims mockClaims = mock(Claims.class);
        when(mockClaims.get("email")).thenReturn("admin@no-reply.com"); // 关键！返回正确的 email

        when(jwtUtil.parseJwt(validLogoutDto.getToken())) // 假如 validLogoutDto.getToken() 返回一个测试 token
                .thenReturn(mockClaims);

        // 2. 模拟：authService.logout("admin@no-reply.com") 返回成功页面
        when(authService.logout(validLogoutDto.getToken()))
                .thenReturn("redirect:/login");

        // 3. 发起请求，并断言响应
        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"Bearer eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFkbWluQG5vLXJlcGx5LmNvbSIsInN1YiI6ImFkbWluQG5vLXJlcGx5LmNvbSIsImlhdCI6MTc1NzQ3MTg0MiwiZXhwIjoxNzU3NDc5MDQyfQ.4pNiMJe7TISeM0Vfu4E2iF4D4xEKw_r_56vruvW2tf0")
                        .content(objectMapper.writeValueAsString(validLogoutDto)))
                .andExpect(status().isOk())
                .andExpect(content().string("redirect:/login"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN));

        // 4. 验证：jwtUtil 和 authService 的方法是否被正确调用
        verify(jwtUtil, times(1)).parseJwt(validLogoutDto.getToken());
        verify(authService, times(1)).logout(validLogoutDto.getToken());
    }

    // 登出无效token场景（无需修改）
    @Test
    public void testLogout_InvalidToken() throws Exception {
        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"")
                        .content(objectMapper.writeValueAsString(invalidLogoutDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        verify(authService, never()).logout(anyString());
    }
}