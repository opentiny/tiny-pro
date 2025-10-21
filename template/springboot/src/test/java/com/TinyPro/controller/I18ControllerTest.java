package com.TinyPro.controller;

import com.TinyPro.aspect.PermissionAspect;
import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.vo.I18Vo;
import com.TinyPro.entity.vo.LangVo;
import com.TinyPro.filter.RejectInterceptor;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.II18Service;
import com.TinyPro.service.PermissionCheckService;
import com.TinyPro.utils.JwtUtil;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class I18ControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private PermissionCheckService permissionCheckService;
    @MockBean
    private II18Service i18Service;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private RedisUtil redisUtil;

    private CreateI18Dto createI18Dto;
    private UpdateI18Dto updateI18Dto;
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
    public void setUp() {
        createI18Dto = new CreateI18Dto();
        createI18Dto.setLang(1);
        createI18Dto.setKey("test.key");
        createI18Dto.setContent("test content");
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
        updateI18Dto = new UpdateI18Dto();
    }

    // ===================== createI18Dto - POST /i18 =====================
    @Test
    public void testCreateI18_Success() throws Exception {
        I18 mockI18 = new I18();
        mockI18.setId(1285);
        mockI18.setKey("vali.NOT_EMPTY");
        mockI18.setContent("该不能为空");

        Lang mockLang = new Lang();
        mockLang.setId(1);
        mockLang.setName("zhCN");
        mockI18.setLang(mockLang);
        when(i18Service.create(any(CreateI18Dto.class)))
                .thenAnswer(item ->ResponseEntity.ok(mockI18));

        mockMvc.perform(MockMvcRequestBuilders.post("/i18")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .content("{\"lang\": 1, \"key\": \"vali.NOT_EMPTY\", \"content\": \"该不能为空\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1285))
                .andExpect(jsonPath("$.key").value("vali.NOT_EMPTY"))
                .andExpect(jsonPath("$.content").value("该不能为空"))
                .andExpect(jsonPath("$.lang").exists());
    }

    @Test
    public void testGetFormat_Success() throws Exception {
        Map<String, Map<String, String>> mockResult = new HashMap<>();
        Map<String, String> langMap = new HashMap<>();
        langMap.put("key1", "value1");
        mockResult.put("en", langMap);

        when(i18Service.getFormat( any()))
                .thenReturn(mockResult);

        mockMvc.perform(MockMvcRequestBuilders.get("/i18/format")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "en": {
                            "key1": "value1"
                          }
                        }
                        """));
    }

    // ===================== findAll - GET /i18 =====================
    @Test
    public void testFindAll_Success() throws Exception {
        I18Vo vo1 = new I18Vo(1, "key1", "内容1", new LangVo(1, "zhCN"));
        I18Vo vo2 = new I18Vo(2, "key2", "内容2", new LangVo(2, "enUS"));
        List<I18Vo> mockVoList = Arrays.asList(vo1, vo2);

        Page<I18Vo> mockPage = new PageImpl<>(
                mockVoList,
                PageRequest.of(0, 10),
                2L
        );

        PageWrapper<I18Vo> mockWrapper = PageWrapper.of(mockPage);

        when(i18Service.findAll(anyInt(), anyInt(), anyBoolean(), any(), any(), any()))
                .thenAnswer(item ->ResponseEntity.ok(mockWrapper));

        mockMvc.perform(MockMvcRequestBuilders.get("/i18")
                        .param("page", "1")
                        .param("limit", "10")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk());
    }
    @Test
    public void testFindOne_Success() throws Exception {
        I18Vo mockVo = new I18Vo(1285,"vali.NOT_EMPTY","该不能为空",new LangVo(1,"zhCN"));
        when(i18Service.getI18ById(anyInt()))
                .thenAnswer(item ->mockVo);
        mockMvc.perform(MockMvcRequestBuilders.get("/i18/1")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk());
    }

    @Test
    public void testUpdate_Success() throws Exception {
        when(i18Service.updateByi18nId(anyLong(), any(UpdateI18Dto.class)))
                .thenAnswer(item ->new ResponseEntity<>(new I18Vo(1285,"vali.NOT_EMPTY","该不能为空",new LangVo(1,"zhCN")), HttpStatus.OK));

        mockMvc.perform(MockMvcRequestBuilders.patch("/i18/1")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
    }

    // ===================== remove - DELETE /i18/{id} =====================
    @Test
    public void testRemove_Success() throws Exception {
        I18 mockI18 = new I18();
        when(i18Service.removei18ById(anyInt()))
                .thenAnswer(item ->mockI18);

        mockMvc.perform(MockMvcRequestBuilders.delete("/i18/1")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .content("{}")
                )
                .andExpect(status().isOk());
    }

    @Test
    public void testBatchRemove_Success() throws Exception {
        List<Long> ids = Arrays.asList(1L, 2L, 3L);
        when(i18Service.batchDeleteUser(anyList()))
                .thenReturn(new ResponseEntity<>(List.of(new I18()), HttpStatus.OK));

        mockMvc.perform(MockMvcRequestBuilders.post("/i18/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .content("[1, 2, 3]"))
                .andExpect(status().isOk());
    }
}