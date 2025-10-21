package com.TinyPro.controller;

import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.vo.MenuVo;
import com.TinyPro.filter.RejectInterceptor;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IMenuService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IMenuService iMenuService;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private RedisUtil redisUtil;
    @MockBean
    private PermissionCheckService permissionCheckService;

    private MenuVo mockMenuVo;
    private Menu mockMenu;
    private List<MenuVo> mockMenuVoList;
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
        // 模拟一个 MenuVo
        mockMenuVo = new MenuVo();
        mockMenuVo.setId(1);
        mockMenuVo.setLabel("Dashboard");
        mockMenuVo.setParentId(null);
        mockMenuVo.setOrder(1);
        mockMenuVo.setUrl("/dashboard");
        mockMenuVo.setComponent("DashboardComponent");
        mockMenuVo.setCustomIcon("icon-dashboard");
        mockMenuVo.setLocale("zh_CN");
        mockMenuVo.setMenuType("MENU");

        // 模拟一个 Menu（用于 createMenu 返回）
        mockMenu = new Menu();
        mockMenu.setId(1);
        mockMenu.setName("Dashboard");
        mockMenu.setPath("/dashboard");
        mockMenu.setParentId(null);

        // 模拟返回的菜单列表
        mockMenuVoList = Arrays.asList(mockMenuVo);
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

    // ===================== testGetMenusByEmail =====================
    @Test
    public void testGetMenusByEmail() throws Exception {
        // 模拟 service 返回
        when(iMenuService.getMenubyEmail(anyString()))
                .thenReturn(ResponseEntity.ok(mockMenuVoList));

        // 模拟请求
        mockMvc.perform(get("/menu/role/admin@example.com")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].label").value("Dashboard"))
                .andExpect(jsonPath("$[0].url").value("/dashboard"));
    }

    // ===================== testGetAllMenus =====================
    @Test
    public void testGetAllMenus() throws Exception {
        when(iMenuService.findAllMenu())
                .thenReturn(ResponseEntity.ok(mockMenuVoList));

        mockMvc.perform(get("/menu")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].label").value("Dashboard"));
    }

    // ===================== testCreateMenu =====================
    @Test
    public void testCreateMenu() throws Exception {
        when(iMenuService.createMenu(any(), anyBoolean()))
                .thenReturn(ResponseEntity.ok(mockMenu));

        mockMvc.perform(post("/menu")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Dashboard",
                                  "path": "/dashboard",
                                  "component": "DashboardComponent",
                                  "order": 1,
                                  "menuType": "MENU",
                                  "parentId": null,
                                  "icon": "icon-dashboard",
                                  "locale": "zh_CN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dashboard"))
                .andExpect(jsonPath("$.path").value("/dashboard"));
    }

    // ===================== testUpdateMenu =====================
    @Test
    public void testUpdateMenu() throws Exception {
        when(iMenuService.updateMenu(any()))
                .thenReturn(ResponseEntity.ok(true));

        mockMvc.perform(patch("/menu")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .contentType("application/json")
                        .content("""
                                {
                                  "id": "1",
                                  "name": "Updated Dashboard",
                                  "path": "/updated-dashboard",
                                  "component": "UpdatedComponent",
                                  "order": 2,
                                  "menuType": "MENU",
                                  "parentId": 0,
                                  "icon": "icon-updated",
                                  "locale": "zh_CN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("true")); // ResponseEntity<Boolean> 返回 true
    }

    // ===================== testDeleteMenu =====================
    @Test
    public void testDeleteMenu() throws Exception {
        when(iMenuService.deleteMenu(anyInt(), anyInt()))
                .thenReturn(ResponseEntity.ok(mockMenu));

        mockMvc.perform(delete("/menu")
                        .param("id","1")
                        .param("parentId","0")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Dashboard"));
    }
}