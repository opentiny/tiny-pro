package com.TinyPro;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.TinyPro.jpa.ApplicationRepository;
import com.TinyPro.jpa.I18Repository;
import com.TinyPro.jpa.IMenuRepository;
import com.TinyPro.jpa.IPermissionRepository;
import com.TinyPro.jpa.IRoleRepository;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.jpa.LangRepository;
import com.TinyPro.redis.RedisLockService;
import com.TinyPro.redis.RedisUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.HashSet;
import java.util.List;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:tinypro_runner;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,KEY,ORDER",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class DataInitializerRunnerTest {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@no-reply.com";

    @Autowired
    private DataSource dataSource;
    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private IRoleRepository roleRepository;
    @Autowired
    private IPermissionRepository permissionRepository;
    @Autowired
    private IMenuRepository menuRepository;
    @Autowired
    private LangRepository langRepository;
    @Autowired
    private I18Repository i18Repository;
    @Autowired
    private ApplicationRepository applicationRepository;

    @MockBean
    private RedisLockService redisLockService;
    @MockBean
    private RedisUtil redisUtil;
    private RedisConnectionFactory redisConnectionFactory;

    private DataInitializer initializer;

    @BeforeEach
    void setUp() {
        redisConnectionFactory = Mockito.mock(RedisConnectionFactory.class);
        initializer = new DataInitializer();
        ReflectionTestUtils.setField(initializer, "dataSource", dataSource);
        ReflectionTestUtils.setField(initializer, "redisConnectionFactory", redisConnectionFactory);
        ReflectionTestUtils.setField(initializer, "userRepository", userRepository);
        ReflectionTestUtils.setField(initializer, "roleRepository", roleRepository);
        ReflectionTestUtils.setField(initializer, "permissionRepository", permissionRepository);
        ReflectionTestUtils.setField(initializer, "menuRepository", menuRepository);
        ReflectionTestUtils.setField(initializer, "langRepository", langRepository);
        ReflectionTestUtils.setField(initializer, "i18Repository", i18Repository);
        ReflectionTestUtils.setField(initializer, "applicationRepository", applicationRepository);
        ReflectionTestUtils.setField(initializer, "redisLockService", redisLockService);
        ReflectionTestUtils.setField(initializer, "redisUtil", redisUtil);

        // 让测试直接执行 runner 的初始化逻辑，不依赖真实 Redis 锁。
        doAnswer(invocation -> {
            Supplier<?> action = invocation.getArgument(3);
            return action.get();
        }).when(redisLockService).execute(
                eq("install"), anyLong(), anyLong(), any(Supplier.class));

        // 模拟安装标记丢失，强制进入完整初始化流程。
        when(redisUtil.exists(Contants.INSTALL_FLAG)).thenReturn(false);
        when(redisConnectionFactory.getConnection()).thenReturn(null);
    }

    // 完全空库首次启动时，应创建默认管理员账号。
    @Test
    void firstRunCreatesDefaultAdmin() throws Exception {
        initializer.run();

        assertTrue(userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent());
    }

    // 已存在其他超级管理员时，补种静态数据不能重新创建默认管理员。
    @Test
    void existingAdminDoesNotTriggerDefaultAdminRecreation() throws Exception {
        Role adminRole = saveAdminRole();
        userRepository.saveAndFlush(newUser("owner@example.com", adminRole));

        initializer.run();

        assertTrue(userRepository.findByEmail("owner@example.com").isPresent());
        assertFalse(userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent());
    }

    // 默认管理员被主动删除且安装标记丢失时，应补种应用数据但不能恢复默认账号。
    @Test
    void deletedDefaultAdminIsNotRecreatedDuringReseeding() throws Exception {
        saveAdminRole();

        initializer.run();

        assertTrue(applicationRepository.count() > 0);
        assertFalse(userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent());
    }

    private Role saveAdminRole() {
        Permission superPermission = new Permission();
        superPermission.setName(Contants.ADMIN_SUPE_POWER);
        superPermission.setDesc("super permission");
        permissionRepository.saveAndFlush(superPermission);

        Role adminRole = new Role();
        adminRole.setName(Contants.ADMIN);
        adminRole.setPermission(new HashSet<>(List.of(superPermission)));
        adminRole.setMenus(new HashSet<>());
        return roleRepository.saveAndFlush(adminRole);
    }

    private User newUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setName("existing-admin");
        user.setStatus(Contants.USER_STATUS_YES);
        user.setRole(List.of(role));
        return user;
    }
}
