package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.entity.vo.TokenPair;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.filter.RejectInterceptor;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.PermissionCheckService;
import com.TinyPro.utils.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
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
    private PermissionCheckService permissionCheckService;
    @MockBean
    private IAuthService authService;

    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private RedisUtil redisUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateAuthDto validLoginDto;
    private CreateAuthDto invalidLoginDto;
    private LogoutAuthDto validLogoutDto;
    private LogoutAuthDto invalidLogoutDto;

    private static final String LOGIN_ENDPOINT = "/auth/login";
    private static final String LOGOUT_ENDPOINT = "/auth/logout";
    private static final String REFRESH_ENDPOINT = "/auth/token/refresh";
    private static final String API_TOKEN_ENDPOINT = "/auth/api-token";
    private static final String REVOKE_API_TOKEN_ENDPOINT = "/auth/revoke-api-token";
    @TestConfiguration
    static class TestConfig {
        @Bean
        public RejectInterceptor rejectInterceptor() {
            return new RejectInterceptor() {
                @Override
                public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                    // 直接放行，不进行拦截
                    return true;
                }
            };
        }
    }

    @BeforeEach
    void setUp() {
        // 有效登录DTO
        validLoginDto = new CreateAuthDto();
        validLoginDto.setEmail("test@example.com");
        validLoginDto.setPassword("admin");

        // 无效登录DTO（缺少邮箱）
        invalidLoginDto = new CreateAuthDto();
        invalidLoginDto.setPassword("password123");

        // 有效登出DTO
        validLogoutDto = new LogoutAuthDto();
        validLogoutDto.setToken(Contants.TOKEN);

        // 无效登出DTO（空token）
        invalidLogoutDto = new LogoutAuthDto();
        invalidLogoutDto.setToken("");

        // ========== Mock JWT ==========
        Claims mockClaims = Mockito.mock(Claims.class);
        when(mockClaims.get("email", String.class)).thenReturn("test@example.com");
        when(jwtUtil.parseJwt(anyString())).thenReturn(mockClaims);

        // ========== Mock Redis ==========
        String fakeUserJson = """
            {
                "id": 1,
                "email": "test@example.com",
                "name": "Test User"
            }
        """;
        when(redisUtil.getValue(anyString())).thenReturn(fakeUserJson);

        // ========== Mock 权限校验（如果有） ==========
        doNothing().when(permissionCheckService).checkPermission(any(), any(), any(),any());
    }

    // 测试登录成功场景（关键修改：显式指定ResponseEntity<?>）
    @Test
    public void testLogin_Success() throws Exception {
        Map<String, String> successResponse = new HashMap<>();
        successResponse.put("token", "mocked-jwt-token");
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
        when(authService.login(any(CreateAuthDto.class), any(HttpServletResponse.class)))
                .thenAnswer(invalidLogin ->ResponseEntity.<ResponseEntity<?>>status(401).body(Map.of("message", "邮箱或密码错误")));

        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginDto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("邮箱或密码错误"));
    }

    @Test
    public void testRefreshToken_ReturnsTokenPair() throws Exception {
        when(authService.refreshToken("refresh-token"))
                .thenReturn(new TokenPair("access-token", "new-refresh-token", 7200000L, 604800000L));

        mockMvc.perform(post(REFRESH_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"))
                .andExpect(jsonPath("$.accessTokenTTL").value(7200000))
                .andExpect(jsonPath("$.refreshTokenTTL").value(604800000));
    }

    @Test
    public void testGenerateApiToken_ReturnsNestCompatibleResponse() throws Exception {
        when(authService.generateApiToken(any()))
                .thenReturn(new ApiToken("api-token", "integration", 604800L));

        mockMvc.perform(post(API_TOKEN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@example.com\",\"password\":\"admin\",\"tokenName\":\"integration\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("api-token"))
                .andExpect(jsonPath("$.tokenId").value("integration"))
                .andExpect(jsonPath("$.expiresIn").value(604800));
    }

    @Test
    public void testRevokeApiToken_ReturnsOk() throws Exception {
        mockMvc.perform(post(REVOKE_API_TOKEN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + Contants.TOKEN)
                        .content("{\"email\":\"test@example.com\",\"tokenId\":\"integration\"}"))
                .andExpect(status().isOk());

        verify(authService).revokeApiToken(any());
    }

    // 登出成功场景（无需修改，因返回值是String，无泛型冲突）
    @Test
    public void testLogout_Success() throws Exception {
        when(authService.logout(anyString()))
                .thenReturn("redirect:/login");

        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"Bearer "+ Contants.TOKEN)
                        .content(objectMapper.writeValueAsString(validLogoutDto)))
                .andExpect(status().isOk());
    }

    // 登出无效token场景（无需修改）
    @Test
    public void testLogout_InvalidToken() throws Exception {
        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"Bearer "+ Contants.TOKEN)
                        .content(objectMapper.writeValueAsString(invalidLogoutDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        verify(authService, never()).logout(anyString());
    }
}
