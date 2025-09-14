package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.imp.PermissionCheckService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
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
