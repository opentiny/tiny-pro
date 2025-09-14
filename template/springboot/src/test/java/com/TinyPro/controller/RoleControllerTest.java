package com.TinyPro.controller;

import com.TinyPro.aspect.PermissionAspect;
import com.TinyPro.controller.contants.Contants;
import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.entity.vo.RolePMVo;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IRoleService;
import com.TinyPro.service.imp.PermissionCheckService;
import com.TinyPro.utils.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private IRoleService roleService;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private RedisUtil redisUtil;
    @MockBean
    private PermissionCheckService permissionCheckService;

    private CreateRoleDto createRoleDto;
    private List<RoleSimpleVo> mockRoleSimpleVoList;
    private Map<String, String> mockDeleteResult;
    private Role mockRole;
    private UpdateRoleDto updateRoleDto;

    @BeforeEach
    public void setUp() {
        createRoleDto = new CreateRoleDto();
        createRoleDto.setName("zzl");
        createRoleDto.setPermissionIds(Arrays.asList(1l,2l,4l));
        createRoleDto.setMenuIds(Arrays.asList(1l,3l,5l));
        mockDeleteResult = new HashMap<>();
        mockDeleteResult.put("name", "Admin");
        mockRole = new Role();
        mockRole.setId(2);
        mockRole.setName("zzl");
        Menu menu = new Menu();
        menu.setId(11);
        menu.setMenuType("normal");
        menu.setParentId(null);
        menu.setOrder(5);
        menu.setName("Result");
        menu.setPath("result");
        menu.setLocale("menu.result");
        menu.setComponent("result/index");
        menu.setIcon("IconSuccessful");
        Set<Menu> roleSet = Set.of(menu);
        mockRole.setMenus(roleSet);
        Permission permission = new Permission();
        permission.setId(1);
        permission.setName("*");
        permission.setDesc("super permission");
        Set<Permission> permission1 = Set.of(permission);
        mockRole.setPermission(permission1);
        mockRoleSimpleVoList = Collections.singletonList(RoleSimpleVo.fromEntity(mockRole));

        updateRoleDto = new UpdateRoleDto();
        updateRoleDto.setId(1);
        updateRoleDto.setName("admin");
        List<Long>  menulist =  new ArrayList<Long>();
        menulist.add(11L);
        List<Long>  permissionList =  new ArrayList<Long>();
        permissionList.add(1L);
        updateRoleDto.setMenus(List.of(menu));
        updateRoleDto.setMenuIds(menulist);
        updateRoleDto.setPermission(List.of(permission));
        updateRoleDto.setPermissionIds(permissionList);
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
        doNothing().when(permissionCheckService).check(any(), any(), any());
    }

    // ===================== testCreateRole =====================
    @Test
    public void testCreateRole() throws Exception {
        when(roleService.createRole(any(), eq(false)))
                .thenReturn(ResponseEntity.ok(mockRole));

        MvcResult result = mockMvc.perform(post("/role")
                        .contentType("application/json")
                        .header("Authorization", "Bearer " + Contants.TOKEN)
                        .content("""
                                {
                                  "name": "Admin",
                                  "permissionIds": [1],
                                  "menuIds": [11]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("zzl"))
                .andReturn();
    }

    @Test
    public void testGetAllRole() throws Exception {
        when(roleService.findAllRole())
                .thenReturn(ResponseEntity.ok(mockRoleSimpleVoList));

        MvcResult result = mockMvc.perform(get("/role")
                        .header("Authorization", "Bearer " + Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("zzl"))
                .andReturn();
    }

    @Test
    public void testGetAllRoleDetail() throws Exception {
        // 模拟 Role
        Role mockRole = new Role();
        mockRole.setId(1);
        mockRole.setName("Admin"); Menu menu = new Menu();
        menu.setId(11);
        menu.setMenuType("normal");
        menu.setParentId(null);
        menu.setOrder(5);
        menu.setName("Result");
        menu.setPath("result");
        menu.setLocale("menu.result");
        menu.setComponent("result/index");
        menu.setIcon("IconSuccessful");
        Set<Menu> roleSet = Set.of(menu);
        mockRole.setMenus(roleSet);
        Permission permission = new Permission();
        permission.setId(1);
        permission.setName("*");
        permission.setDesc("super permission");
        Set<Permission> permission1 = Set.of(permission);
        mockRole.setPermission(permission1);


        // 模拟 Page<Role>
        Page<Role> rolePage = new PageImpl<>(Collections.singletonList(mockRole));
        PageWrapper<Role> rolePageWrapper =  PageWrapper.of(rolePage);



        // 模拟 MenuTreeVo（树根）
        MenuTreeVo menuTreeVo = new MenuTreeVo();
        menuTreeVo.setId(1);
        menuTreeVo.setLabel("Dashboard");
        menuTreeVo.setUrl("/dashboard");
        menuTreeVo.setParentId(null);
        menuTreeVo.setChildren(null);

        // 构建 RolePMVo
        RolePMVo mockRolePMVo = new RolePMVo();
        mockRolePMVo.setRoleInfo(rolePageWrapper);
        mockRolePMVo.setMenuTree(menuTreeVo);

        when(roleService.findAllDetail(any(), any(), anyString()))
                .thenReturn(ResponseEntity.ok(mockRolePMVo));

        // 模拟请求 & 断言
        mockMvc.perform(get("/role/detail")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("name", "Admin")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleInfo").exists())
                .andExpect(jsonPath("$.roleInfo.items").isArray())
                .andExpect(jsonPath("$.roleInfo.items.[0].id").exists())
                .andExpect(jsonPath("$.roleInfo.items.[0].name").exists())
                .andExpect(jsonPath("$.roleInfo.items.[0].permission").exists())
                .andExpect(jsonPath("$.roleInfo.items.[0].menus").exists()) ;
    }

//    // ===================== testUpdateRole =====================
    @Test
    public void testUpdateRole() throws Exception {
        when(roleService.updateRole(any()))
                .thenReturn(ResponseEntity.ok(mockRole));
        ObjectMapper objectMapper = new ObjectMapper();
        String requestBodyJson = objectMapper.writeValueAsString(updateRoleDto);
        mockMvc.perform(patch("/role")
                        .contentType("application/json")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                        .content(requestBodyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.permission").exists())
                .andExpect(jsonPath("$.menus").exists());
    }

    // ===================== testDeleteRole =====================
    @Test
    public void testDeleteRole() throws Exception {
        when(roleService.removeRoleById(eq(1)))
                .thenReturn(ResponseEntity.ok(mockDeleteResult));


        mockMvc.perform(delete("/role/1")
                        .header("Authorization", "Bearer "+Contants.TOKEN)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Admin"));
    }

}