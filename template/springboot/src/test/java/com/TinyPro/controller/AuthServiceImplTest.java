package com.TinyPro.controller;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.imp.AuthServiceImpl;
import com.TinyPro.utils.JwtUtil;
import com.TinyPro.utils.Sha256Utils;
import com.alibaba.fastjson.JSON;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = AuthServiceImpl.class) // 仅加载 AuthServiceImpl 所在的上下文，可优化为更小的配置
public class AuthServiceImplTest {

    @Autowired
    private IAuthService authService; // 被测试的 Service，即 AuthServiceImpl

    @MockBean
    private IUserRepository userService; // 模拟 UserRepository

    @MockBean
    private JwtUtil jwtUtil; // 模拟 JwtUtil

    @MockBean
    private RedisUtil redisUtil; // 模拟 RedisUtil

    @MockBean
    private MessageSource messageSource;

    private CreateAuthDto validLoginDto;
    private User mockUser;

    @BeforeEach
    void setUp() throws Exception {
        // 模拟一个合法的登录请求
        validLoginDto = new CreateAuthDto();
        validLoginDto.setEmail("test@example.com");
        validLoginDto.setPassword("123456");

        // 模拟数据库中的用户对象
        mockUser = new User();
        mockUser.setEmail("test@example.com");
        mockUser.setSalt("somesalt");
        mockUser.setPassword("hashedpassword123"); // 假设这是加盐加密后的密码

        // 模拟 Sha256Utils 加密结果
        when(Sha256Utils.encry(eq("123456"), eq("somesalt"))).thenReturn("hashedpassword123");

        // 模拟 JwtUtil 生成 Token
        when(jwtUtil.generateJwt(eq("test@example.com"), eq(Contants.H_2))).thenReturn("fake-jwt-token");
        // 模拟 Redis 存储
        String redisKey = Contants.UserJwtTop + "test@example.com" + Contants.UserJwtbt;
        doNothing().when(redisUtil).setValue(eq(redisKey), anyString(), eq(Contants.H_2));
    }

    // =========================================
    // ✅ 测试 login() 成功：用户存在，密码正确
    // =========================================
    @Test
    void testLogin_Success() throws Exception {
        // 模拟根据邮箱查到用户
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        // 调用 login 方法
        ResponseEntity<?> response = authService.login(validLoginDto, null);

        // 断言：HTTP 状态码 200
        assertEquals(200, response.getStatusCodeValue());

        // 断言：返回体不为空，且是一个 Map
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof java.util.Map);

        @SuppressWarnings("unchecked")
        java.util.Map<String, String> result = (java.util.Map<String, String>) response.getBody();

        // 断言：返回的 token 正确
        assertEquals("fake-jwt-token", result.get("token"));
    }

    // =========================================
    // ❌ 测试 login() 失败：用户不存在
    // =========================================
    @Test
    void testLogin_UserNotFound() throws Exception {
        // 模拟用户不存在
        when(userService.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        CreateAuthDto invalidDto = new CreateAuthDto();
        invalidDto.setEmail("unknown@example.com");
        invalidDto.setPassword("123456");

        // 验证是否抛出 BusinessException
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(invalidDto, null);
        });
        assertEquals(404, exception.getHttpStatus().value());
    }

    // =========================================
    // ❌ 测试 login() 失败：密码错误
    // =========================================
    @Test
    void testLogin_WrongPassword() throws Exception {
        // 模拟用户存在，但密码不匹配
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        // 模拟错误密码的加密结果不匹配
        when(Sha256Utils.encry(eq("wrongpassword"), eq("somesalt"))).thenReturn("wronghash");

        CreateAuthDto wrongPwdDto = new CreateAuthDto();
        wrongPwdDto.setEmail("test@example.com");
        wrongPwdDto.setPassword("wrongpassword");

        // 验证是否抛出异常：密码错误
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(wrongPwdDto, null);
        });

        assertEquals(400, exception.getHttpStatus().value());
    }

    // =========================================
    // ✅ 测试 logout() 成功：email 合法
    // =========================================
    @Test
    void testLogout_Success() {
        String email = "test@example.com";

        // 调用 logout
        String result = authService.logout(email);

        // 验证 redis 删除被调用
        verify(redisUtil, times(1)).deleteValue(email);

        // 断言返回 redirect 字符串
        assertEquals("redirect:/login", result);
    }

    // =========================================
    // ❌ 测试 logout() 失败：email 为空
    // =========================================
    @Test
    void testLogout_EmptyEmail() {
        String emptyEmail = "";

        // 验证是否抛出异常
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.logout(emptyEmail);
        });

        assertEquals(404, exception.getHttpStatus().value());
    }
}