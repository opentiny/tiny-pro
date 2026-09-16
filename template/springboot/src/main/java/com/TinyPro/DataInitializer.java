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

    @Override
    public void run(String... args) throws Exception {
        testMysqlConnection();
        testRedisConnection();
        initI18n();
        initApplications();
        initPermissions();
        initMenus();
        Role role = initRole();
        initUser(role);
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
                        "Tiny Design 设计体系",
                        "华为云产品和服务的规范体系，包括交互视觉设计、业务流程、国际化、术语词条。",
                        "[{ \"type\": \"\", \"value\": \"机会点定义\" }, { \"type\": \"danger\", \"value\": \"交互设计\" }]",
                        "card-list-application-default.png",
                        "design"
                ),
                new Application(
                        "Tiny DesignLink 设计流水线工具",
                        "设计+协同+资源管理，一个工具就够了，在线原型设计、设计过程融入DevOps流程。",
                        "[{ \"type\": \"error\", \"value\": \"交互设计\" }, { \"type\": \"warning\", \"value\": \"视觉设计\" }]",
                        "card-list-application-default.png",
                        "design"
                ),
                new Application(
                        "TinyUI3.0 开发工具 ",
                        "Cloud Design System 提供了丰富的规范文档及开发组件。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-application-default.png",
                        "dev"
                ),
                new Application(
                        "TinyPlus3.0 开发工具",
                        "TinyPlus3.0 是基于Angular + Typescript的Web前端云业务组件库。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-tiny-plus.png",
                        "dev"
                ),
                new Application(
                        "Tiny Stage 工程工具 ",
                        "一个跨平台的前端工程化cli工具，为开发提供一系列开发套件和工程插件",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "Tiny Flow 接口编排工具 ",
                        "端到端的API编排解决方案，通过可视化编程的方式快速生成、发布、调试的API编排。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "Tiny Gate 门禁系统",
                        "门禁系统，通过卡点方式集成到伏羲流水线，在服务发布时生成预览页面。",
                        "[{ \"type\": \"info\", \"value\": \"测试验证\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "Console Framework 控制台框架",
                        "华为云各服务快速构建管理控制台的平台。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" },{ \"type\": \"info\", \"value\": \"测试验证\" },{ \"type\": \"warning\", \"value\": \"上线\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "Nodejs Framework Nodejs应用",
                        "基于egg的定制化web服务框架，让你快速上手Nodejs做BFF意见微服务。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" },{ \"type\": \"info\", \"value\": \"测试验证\" }]",
                        "card-list-console-framework.png",
                        "dev"
                ),
                new Application(
                        "Furion 前端体验监控",
                        "提供端到端前端用户体验度量，让产品用户体验可度量、可监控、可优化。",
                        "[{ \"type\": \"\", \"value\": \"机会点定义\" }]",
                        "card-list-furion.png",
                        "dev"
                ),
                new Application(
                        "Tiny Mock API 管理",
                        "功能强大的API管理平台，旨在为开发、产品、测试人员提供更优雅的接口管理服务。",
                        "[{ \"type\": \"success\", \"value\": \"开发\" },{ \"type\": \"warning\", \"value\": \"视觉设计\" }]",
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
                () -> menuRepository.findFirstByNameOrderByIdAsc(menu.getName()).orElse(null),
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
