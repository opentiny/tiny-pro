package com.TinyPro;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.InitMenuDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.po.Menu;
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
import com.TinyPro.utils.Sha256Utils;
import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RedisConnectionFactory redisConnectionFactory;
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

    @Autowired
    private RedisLockService redisLockService;
    @Autowired
    private RedisUtil redisUtil;

    @Override
    public void run(String... args) throws Exception {
        redisLockService.execute("install", 60_000L, 300_000L, () -> {
            try {
                initializeDefaultData();
                return null;
            } catch (Exception exception) {
                throw new IllegalStateException("Failed to initialize default data", exception);
            }
        });
    }

    private void initializeDefaultData() throws IOException {
        if (redisUtil.exists(Contants.INSTALL_FLAG) && requiredSeedDataExists()) {
            logger.info("[APP]: Already installed; skip default data initialization");
            return;
        }

        if (redisUtil.exists(Contants.INSTALL_FLAG)) {
            logger.warn("[APP]: Installation flag exists but required seed data is incomplete; re-running initialization");
        }

        testMysqlConnection();
        testRedisConnection();
        initI18n();
        initApplications();
        initPermissions();
        initMenus();
        Role role = initRole();
        initUser(role);
        redisUtil.setPersistentValue(Contants.INSTALL_FLAG, "1");
        logger.info("[APP]: installation flag persisted: {}", Contants.INSTALL_FLAG);
    }

    /**
     * Redis and MySQL can be restored independently. Do not trust the Redis
     * installation marker unless the database still contains the seed data
     * required by the application. The check intentionally verifies that the
     * user table has data instead of requiring a specific default account;
     * deleting the default admin must not recreate it on the next restart.
     */
    private boolean requiredSeedDataExists() {
        return permissionRepository.existsByName(Contants.ADMIN_SUPE_POWER)
                && roleRepository.findFirstByNameOrderByIdAsc(Contants.ADMIN).isPresent()
                && userRepository.count() > 0
                && menuRepository.count() > 0
                && langRepository.count() > 0
                && i18Repository.count() > 0
                && applicationRepository.count() > 0;
    }

    private void initI18n() throws IOException {
        ClassPathResource pathResource = new ClassPathResource("locales.json");
        try (InputStream is = pathResource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            Map<String, Map<String, String>> i18nData = JSON.parseObject(json, Map.class);
            for (Map.Entry<String, Map<String, String>> outerEntry : i18nData.entrySet()) {
                String langName = outerEntry.getKey();
                Lang lang = findOrInsert(
                        () -> langRepository.findFirstByNameOrderByIdAsc(langName).orElse(null),
                        () -> {
                            Lang newLang = new Lang();
                            newLang.setName(langName);
                            return langRepository.saveAndFlush(newLang);
                        }
                );

                for (Map.Entry<String, String> innerEntry : outerEntry.getValue().entrySet()) {
                    saveI18(lang, innerEntry.getKey(), innerEntry.getValue());
                }
            }
        }
    }

    private I18 saveI18(Lang lang, String key, String content) {
        return findOrInsert(
                () -> i18Repository.findFirstByKeyAndLang_IdOrderByIdAsc(key, Long.valueOf(lang.getId())).orElse(null),
                () -> {
                    I18 i18 = new I18();
                    i18.setLang(lang);
                    i18.setKey(key);
                    i18.setContent(content);
                    return i18Repository.saveAndFlush(i18);
                }
        );
    }

    private void initApplications() {
        List<Application> applicationData = List.of(
                new Application(
                        "TinyVue 组件库",
                        "OpenTiny 企业级 UI 组件库，同时支持 Vue.js 2 与 Vue.js 3，以及 PC 与移动端。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-application-default.png",
                        "dev"
                ),
                new Application(
                        "TinyEngine 低代码引擎",
                        "TinyEngine低代码引擎，AI时代的智能低代码基座。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }, { \"type\": \"danger\", \"value\": \"交互设计\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "TinyTheme 主题配置系统",
                        "OpenTiny 主题配置系统，支持在线定制组件主题与视觉风格。",
                        "[{ \"type\": \"danger\", \"value\": \"交互设计\" }, { \"type\": \"warning\", \"value\": \"视觉设计\" }]",
                        "card-list-application-default.png",
                        "design"
                ),
                new Application(
                        "OpenTiny Icons 图标库",
                        "OpenTiny Design Icons 图标库，为组件与业务页面提供统一图标资源。",
                        "[{ \"type\": \"warning\", \"value\": \"视觉设计\" }]",
                        "card-list-application-default.png",
                        "design"
                ),
                new Application(
                        "TinyCLI 命令行工具",
                        "灵活可扩展的 OpenTiny 前端命令行工具，提供工程化套件与插件。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "TinyPro 中后台模板",
                        "基于 TinyVue 的前后端分离后台管理系统，支持在线配置菜单、路由、国际化，开箱即用。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }, { \"type\": \"warning\", \"value\": \"上线\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "TinyEditor 富文本编辑器",
                        "基于 Quill 2.0 的富文本编辑器，扩展丰富模块与格式，功能强大、开箱即用。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "TinyRobot AI 对话组件库",
                        "AI 对话组件库，提供丰富的 AI 交互组件，助力快速构建企业级 AI 应用。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-furion.png",
                        "dev"
                ),
                new Application(
                        "TinyVue Mobile 移动端组件",
                        "基于 OpenTiny 设计规范的 Vue3 移动端组件库，支持 TypeScript、主题切换与国际化。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-application-default.png",
                        "dev"
                ),
                new Application(
                        "TinyCharts 可视化图表库",
                        "前端可视化图表库，提供 40 多个图表组件，支持主题定制、响应式和无障碍，兼容 ECharts API。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }, { \"type\": \"warning\", \"value\": \"视觉设计\" }]",
                        "card-list-application-default.png",
                        "dev"
                ),
                new Application(
                        "WebMCP SDK",
                        "前端 AI 与浏览器自动化工具包，通过 WebMCP + WebSkills 构建 AI 原生应用。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "GenUI SDK",
                        "面向 Vue、Angular 的 Generative UI SDK，帮助快速生成交互界面。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-application-default.png",
                        "dev"
                )
        );

        for (Application application : applicationData) {
            findOrInsert(
                    () -> applicationRepository.findByName(application.getName()),
                    () -> applicationRepository.saveAndFlush(application)
            );
        }
    }

    private void initPermissions() {
        Map<String, String[]> permissions = new HashMap<>();
        permissions.put("user", new String[]{"add", "remove", "update", "query", "password::force-update", "batch-remove"});
        permissions.put("permission", new String[]{"add", "remove", "update", "get"});
        permissions.put("role", new String[]{"add", "remove", "update", "query"});
        permissions.put("menu", new String[]{"add", "remove", "update", "query"});
        permissions.put("i18n", new String[]{"add", "remove", "update", "query", "batch-remove"});
        permissions.put("lang", new String[]{"add", "remove", "update", "query"});
        permissions.put("application", new String[]{"add"});

        createPermissionIfAbsent("*", "super permission");

        for (Map.Entry<String, String[]> entry : permissions.entrySet()) {
            String module = entry.getKey();
            String[] actions = entry.getValue();
            for (String action : actions) {
                createPermissionIfAbsent(module + "::" + action, "");
            }
        }
    }

    private Permission createPermissionIfAbsent(String name, String desc) {
        return findOrInsert(
                () -> permissionRepository.findFirstByNameOrderByIdAsc(name).orElse(null),
                () -> {
                    Permission permission = new Permission();
                    permission.setName(name);
                    permission.setDesc(desc);
                    return permissionRepository.saveAndFlush(permission);
                }
        );
    }

    private void initMenus() throws IOException {
        List<InitMenuDto> menuData = getMenuData();
        for (InitMenuDto item : menuData) {
            saveMenuTree(item, null);
        }
    }

    private Menu saveMenuTree(InitMenuDto item, Integer parentId) {
        if (item == null) {
            return null;
        }

        Menu menu = new Menu();
        BeanUtils.copyProperties(item, menu);
        menu.setId(null);
        menu.setParentId(parentId);

        Menu persisted = findOrInsert(
                () -> menuRepository.findByMenuIdentity(
                        menu.getName(),
                        menu.getOrder(),
                        menu.getMenuType(),
                        menu.getParentId(),
                        menu.getPath(),
                        menu.getIcon(),
                        menu.getComponent(),
                        menu.getLocale()
                ).stream().findFirst().orElse(null),
                () -> menuRepository.saveAndFlush(menu)
        );

        if (item.getChildren() != null) {
            for (InitMenuDto child : item.getChildren()) {
                saveMenuTree(child, persisted.getId());
            }
        }

        return persisted;
    }

    private List<InitMenuDto> getMenuData() throws IOException {
        ClassPathResource pathResource = new ClassPathResource("MenuData.json");
        try (InputStream is = pathResource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return JSON.parseArray(json, InitMenuDto.class);
        }
    }

    private Role initRole() {
        Permission superPermission = permissionRepository.findFirstByNameOrderByIdAsc("*")
                .orElseThrow(() -> new IllegalStateException("super permission not initialized"));

        Role role = new Role();
        role.setName(Contants.ADMIN);

        Role persisted = findOrInsert(
                () -> roleRepository.findFirstByNameOrderByIdAsc(Contants.ADMIN).orElse(null),
                () -> roleRepository.saveAndFlush(role)
        );

        persisted.setPermission(new HashSet<>(List.of(superPermission)));
        persisted.setMenus(new HashSet<>(menuRepository.findAll()));
        return roleRepository.saveAndFlush(persisted);
    }

    private void initUser(Role role) {
        User user = new User();
        user.setEmail("admin@no-reply.com");
        String password;
        try {
            password = Sha256Utils.encry(Contants.ADMIN, Contants.PUBLICK_SALT);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        user.setPassword(password);
        user.setName(Contants.ADMIN);
        user.setSalt(Contants.PUBLICK_SALT);
        user.setStatus(Contants.USER_STATUS_YES);
        user.setRole(List.of(role));

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.info("[APP]: admin user exists, skip create");
            return;
        }

        try {
            userRepository.saveAndFlush(user);
            logger.info("[APP]: create admin user success");
            logger.info("[APP]: default admin credentials created; password omitted from logs");
            logger.info("Enjoy!");
        } catch (DataIntegrityViolationException ex) {
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                logger.info("[APP]: admin user was created concurrently, skip create");
                return;
            }
            throw ex;
        }
    }

    private <T> T findOrInsert(Supplier<T> lookupAction, Supplier<T> insertAction) {
        T existing = lookupAction.get();
        if (existing != null) {
            return existing;
        }

        try {
            return insertAction.get();
        } catch (DataIntegrityViolationException ex) {
            T concurrent = lookupAction.get();
            if (concurrent != null) {
                return concurrent;
            }
            throw ex;
        }
    }

    private void testMysqlConnection() {
        try (Connection connection = dataSource.getConnection()) {
            logger.info("[TEST] MySQL connection ok");
        } catch (SQLException e) {
            logger.error("[ERROR] MySQL connection failed", e);
        }
    }

    private void testRedisConnection() {
        try (RedisConnection redisConnection = redisConnectionFactory.getConnection()) {
            logger.info("[TEST] Redis connection ok");
        } catch (Exception e) {
            logger.error("[ERROR] Redis connection failed", e);
        }
    }
}
