package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;
import com.TinyPro.filter.RejectInterceptor;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IUserService;
import com.TinyPro.service.imp.PermissionCheckServiceImpl;
import com.TinyPro.utils.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@SpringBootTest
@AutoConfigureMockMvc
public class PermissionTest {
    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RedisUtil redisUtil;

    @Mock
    private IUserService iUserService;

    @Mock
    private IPermissionService iPermissionService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private PermissionCheckServiceImpl permissionCheckService;

    private Method testMethod;
    private PermissionAnnotation methodAnnotation;
    private PermissionAnnotation classAnnotation;
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private IAuthService authService;
    private static final String LOGOUT_ENDPOINT = "/auth/logout";
    @Autowired
    private ObjectMapper objectMapper;
    @TestConfiguration
    static class TestConfig {
        @Bean
        public RejectInterceptor rejectInterceptor() {
            return new RejectInterceptor() {
                @Override
                public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                    return true;
                }
            };
        }
    }

    private LogoutAuthDto validLogoutDto;
    @BeforeEach
    void setUp() throws NoSuchMethodException {
        validLogoutDto = new LogoutAuthDto();
        validLogoutDto.setToken(Contants.TOKEN);
        methodAnnotation = mock(PermissionAnnotation.class);
        when(methodAnnotation.value()).thenReturn("test:permission");
        classAnnotation = mock(PermissionAnnotation.class);
        when(classAnnotation.value()).thenReturn("test:class:permission");
    }
    @Test
    public void testPermission_Success() throws Exception {
        String token = "valid.token";
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);
        Permission permission = new Permission();
        permission.setName("test:permission");
        permission.setId(1);
        permission.setDesc("测试");
        List<Permission> permissions = Arrays.asList(permission);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.parseJwt(token)).thenReturn(mock(Claims.class));
        when(redisUtil.getValue(anyString())).thenReturn("{\"email\":\"user@example.com\"}");
        when(iUserService.getRoleByUserId(user)).thenReturn(permissions);
        permissionCheckService.checkPermission(request, testMethod, methodAnnotation, classAnnotation);
        assertDoesNotThrow(() -> permissionCheckService.checkPermission(request, testMethod, methodAnnotation, classAnnotation));
    }
    //测试_假的token测试
    @Test
    public void testPermission_Faile() throws Exception {
        when(authService.logout(anyString()))
                .thenReturn("redirect:/login");
        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"Bearer "+ Contants.TRUE_TOKEN)
                        .content(objectMapper.writeValueAsString(validLogoutDto)))
                .andExpect(status().isUnauthorized());
    }
}
