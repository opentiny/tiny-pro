package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.filter.RejectInterceptor;
import com.TinyPro.service.IAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@SpringBootTest
@AutoConfigureMockMvc
public class PermissionTest {
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
                    // 直接放行，不进行拦截
                    return true;
                }
            };
        }
    }

    private LogoutAuthDto validLogoutDto;
    @BeforeEach
    void setUp() {
        validLogoutDto = new LogoutAuthDto();
        validLogoutDto.setToken(Contants.TOKEN);
    }
    //真的token测试
    @Test
    public void testLogout_Success() throws Exception {
        when(authService.logout(anyString()))
                .thenReturn("redirect:/login");

        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"Bearer "+ Contants.TRUE_TOKEN)
                        .content(objectMapper.writeValueAsString(validLogoutDto)))
                .andExpect(status().isOk());
    }
    //假的token测试
    @Test
    public void testLogout_FLASE() throws Exception {
        when(authService.logout(anyString()))
                .thenReturn("redirect:/login");

        mockMvc.perform(post(LOGOUT_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization" ,"Bearer "+ Contants.TRUE_TOKEN)
                        .content(objectMapper.writeValueAsString(validLogoutDto)))
                .andExpect(status().isUnauthorized());
    }
}
