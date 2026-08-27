package com.TinyPro;


import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.InitMenuDto;
import com.TinyPro.entity.po.*;

import com.TinyPro.jpa.*;
import com.TinyPro.utils.Sha256Utils;
import com.alibaba.fastjson.JSON;
import org.apache.commons.lang3.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private DataSource dataSource; // 用于测试 MySQL

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
    @Autowired          // 或构造器注入
    private LangRepository langRepository;
    @Autowired
    private I18Repository i18Repository;
    @Autowired
    private ApplicationRepository applicationRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. 测试 MySQL
        testMysqlConnection();

        // 2. 测试 Redis
        testRedisConnection();
        File lockFile = new File("data/lock");
        if (lockFile.exists()) {
            logger.warn("Lock file exists, if you want init again, please remove data/lock");
            return;
        }

        // 初始化国际化信息
        initI18n();

        // 初始化应用
        initApplications();

        // 初始化权限
        initPermissions();

        // 初始化菜单
        initMenus();

        // 初始化角色
        Role role = initRole();

        // 初始化用户
        initUser(role);

        // 创建锁文件
        lockFile.getParentFile().mkdirs();
        Files.createFile(lockFile.toPath());
    }

    private void initI18n() throws IOException {
        ClassPathResource pathResource = new ClassPathResource("locales.json");
        try (InputStream is = pathResource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            Map<String, Map<String, String>> i18nData = JSON.parseObject(json, Map.class);
            Set<String> existingLangNames = langRepository.findAll()
                    .stream()
                    .map(Lang::getName)
                    .collect(Collectors.toSet());
            // 遍历外层 Map
            for (Map.Entry<String, Map<String, String>> outerEntry : i18nData.entrySet()) {
                String langName = outerEntry.getKey(); // 外层键作为 Lang 的 name
                if (existingLangNames.contains(langName)) {
                    logger.info("语言 {} 已存在，跳过初始化", langName);
                    continue;
                }
                Lang lang = new Lang();
                lang.setName(langName);
                List<I18> i18List = new ArrayList<>();
                // 遍历内层 Map
                for (Map.Entry<String, String> innerEntry : outerEntry.getValue().entrySet()) {
                    String key = innerEntry.getKey(); // 内层键
                    String content = innerEntry.getValue(); // 内层值
                    // 创建 I18 对象
                    I18 i18 = new I18();
                    i18.setKey(key);
                    i18.setContent(content);
                    i18List.add(i18);
                }
                // 将 I18 对象列表设置到 Lang 对象中
                lang.setI18ns(i18List);
                // 先保存 Lang 对象，生成 id
                langRepository.save(lang);
                i18List.forEach(i18 -> {
                    i18.setLang(lang);
                });
                // 保存 I18 对象
                i18Repository.saveAll(i18List);
                // 清空 I18 列表，为下一个 Lang 准备
                i18List.clear();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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

        Set<String> existingAppNames = applicationRepository.findAll()
                .stream()
                .map(Application::getName)
                .collect(Collectors.toSet());
        List<Application> newApplications = applicationData.stream()
                .filter(app -> !existingAppNames.contains(app.getName()))
                .collect(Collectors.toList());

        if (newApplications.isEmpty()) {
            logger.info("没有新应用需要导入，数据库已存在所有应用");
            return;
        }

        applicationRepository.saveAll(newApplications);
        logger.info("成功导入 {} 个新应用", newApplications.size());
    }

    private void initPermissions() {
        Map<String, String[]> permissions = new HashMap<>();
        permissions.put("user", new String[]{"add", "remove", "update", "query", "password::force-update","batch-remove"});
        permissions.put("permission", new String[]{"add", "remove", "update", "get"});
        permissions.put("role", new String[]{"add", "remove", "update", "query"});
        permissions.put("menu", new String[]{"add", "remove", "update", "query"});
        permissions.put("i18n", new String[]{"add", "remove", "update", "query","batch-remove"});
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

    private void createPermissionIfAbsent(String name, String desc) {
        if (permissionRepository.existsByName(name)) {
            return;
        }

        Permission permission = new Permission();
        permission.setName(name);
        permission.setDesc(desc);
        try {
            permissionRepository.save(permission);
        } catch (Exception e) {
            logger.error(e.getMessage());
            logger.error("Please clear the database and try again");
            System.exit(-1);
        }
    }

    private void initMenus() throws IOException {
        List<InitMenuDto> menuData = getMenuData();
        try {
            // 1. 查询数据库中已存在的菜单名称
            List<String> existingMenuNames = menuRepository.findAll()
                    .stream()
                    .map(Menu::getName)
                    .collect(Collectors.toList());
            // 2. 过滤出数据库中不存在的菜单（基于名称比对）
            List<InitMenuDto> newMenus = menuData.stream()
                    .filter(menu -> !existingMenuNames.contains(menu.getName()))
                    .collect(Collectors.toList());
            //3.dfs储存数据
            newMenus.forEach(item -> {
                dfs(item, null);
            });

            // 4. 批量导入新增菜单
            if (!newMenus.isEmpty()) {
                try {
                    logger.info("成功导入 " + newMenus.size() + " 个新菜单");
                } catch (Exception e) {
                    logger.error("导入失败");
                    throw new RuntimeException(e);
                }
            } else {
                logger.info("没有新菜单需要导入，数据库已存在所有菜单");
            }

        } catch (Exception e) {
            logger.error("菜单导入异常: " + e.getMessage());
            logger.error("Please clear the database and try again");
            System.exit(-1);
        }
    }

    private void dfs(InitMenuDto item, Integer value) {
        Menu menu = new Menu();
        if (ObjectUtils.isNotEmpty(item)) {
            BeanUtils.copyProperties(item, menu);
            menu.setParentId(value);
            menu = menuRepository.save(menu);
        }
        if (ObjectUtils.isEmpty(item.getChildren())) {
            return;
        }
        for (InitMenuDto menuDto : item.getChildren()) {
            dfs(menuDto, menu.getId());
        }
    }

    private List<InitMenuDto> getMenuData() throws IOException {
        ClassPathResource pathResource = new ClassPathResource("MenuData.json");
        try (InputStream is = pathResource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            List<InitMenuDto> menuData = JSON.parseArray(json, InitMenuDto.class);
            return menuData;
        }
    }

    private Role initRole() {
        Role role = roleRepository.findAllByName(Contants.ADMIN)
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(Contants.ADMIN);
                    return newRole;
                });

        Permission superPermission = permissionRepository.findAllByName("*")
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("super permission not initialized"));

        role.setPermission(new HashSet<>(List.of(superPermission)));

        Set<Menu> all = menuRepository.findAll().stream().collect(Collectors.toSet());
        role.setMenus(all);
        roleRepository.save(role);
        return role;
    }

    private void initUser(Role role) {
        if (!userRepository.findAllByEmail("admin@no-reply.com").isEmpty()) {
            logger.info("[APP]: admin user exists, skip create");
            return;
        }

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
        List<Role> roleList = List.of(role);
        user.setRole(roleList);
        user = userRepository.save(user);
        logger.info("[APP]: create admin user success");
        logger.info("[APP]: default admin credentials created; password omitted from logs");
        logger.info("Enjoy!");
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
    private void testMysqlConnection() {
        try (Connection connection = dataSource.getConnection()) {
            logger.info("[✅ TEST] MySQL 数据库连接成功！数据库状态正常。");
        } catch (SQLException e) {
            logger.error("[❌ ERROR] MySQL 数据库连接失败！", e);
        }
    }

    private void testRedisConnection() {
        try (RedisConnection redisConnection = redisConnectionFactory.getConnection()) {
            logger.info("[✅ TEST] Redis 连接成功！缓存服务状态正常。");
        } catch (Exception e) {
            logger.error("[❌ ERROR] Redis 连接失败！", e);
        }
    }
}
