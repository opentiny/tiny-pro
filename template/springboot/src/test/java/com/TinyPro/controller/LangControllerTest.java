package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateLangDto;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.ILangService;
import com.TinyPro.service.imp.PermissionCheckService;
import com.TinyPro.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class LangControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ILangService langService;

    private CreateLangDto createLangDto;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private RedisUtil redisUtil;
    @MockBean
    private PermissionCheckService permissionCheckService;

    @BeforeEach
    public void setUp() {
        createLangDto = new CreateLangDto();
        createLangDto.setName("zhCN");
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

        doNothing().when(permissionCheckService).check(any(), any(), any());
    }

    @Test
    public void testCreateLang_Success() throws Exception {
        // 模拟一个返回的 Lang 对象
        Lang mockLang = new Lang();
        mockLang.setId(1);
        mockLang.setName("zhCN");

        when(langService.create(any(CreateLangDto.class)))
                .thenReturn(ResponseEntity.ok(mockLang));
        
        mockMvc.perform(MockMvcRequestBuilders.post("/lang")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "zhCN"
                                }
                                """)
                        .header("Authorization", "Bearer "+Contants.TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("zhCN"));
    }

    // ===================== testFindAllLang_Success =====================
    @Test
    public void testFindAllLang_Success() throws Exception {
        // 模拟返回一个语言列表
        Lang lang1 = new Lang();
        lang1.setId(1);
        lang1.setName("zhCN");

        Lang lang2 = new Lang();
        lang2.setId(2);
        lang2.setName("enUS");

        List<Lang> langList = Arrays.asList(lang1, lang2);

        // 模拟 service 返回
        when(langService.findAll())
                .thenReturn(ResponseEntity.ok(langList));

        // 模拟 GET 请求
        mockMvc.perform(MockMvcRequestBuilders.get("/lang")
                        .header("Authorization","Bearer "+ Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("zhCN"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("enUS"));
    }

    // ===================== testUpdateLang_Success =====================
    @Test
    public void testUpdateLang_Success() throws Exception {
        Integer id = 1;
        Lang updatedLang = new Lang();
        updatedLang.setId(id);
        updatedLang.setName("zhCN-Updated");

        // 模拟 service 返回
        when(langService.update(anyInt(), any(CreateLangDto.class)))
                .thenReturn(ResponseEntity.ok(updatedLang));

        // 模拟 PATCH 请求
        mockMvc.perform(MockMvcRequestBuilders.patch("/lang/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "zhCN-Updated"
                                }
                                """)
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andDo(result -> {
                    System.out.println("Response Body: " + result.getResponse().getContentAsString());
                })
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.name").value("zhCN-Updated"));
    }

    // ===================== testRemoveLang_Success =====================
    @Test
    public void testRemoveLang_Success() throws Exception {
        Integer id = 1;

        Lang removedLang = new Lang();
        removedLang.setId(id);
        removedLang.setName("zhCN");

        when(langService.remove(anyInt()))
                .thenReturn(ResponseEntity.ok(removedLang));

        mockMvc.perform(MockMvcRequestBuilders.delete("/lang/{id}", id)
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("zhCN"));
    }
}