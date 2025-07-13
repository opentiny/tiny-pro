//package com.TinyPro;
//
//
//import com.TinyPro.entity.po.*;
//import com.TinyPro.service.*;
//import com.TinyPro.utils.JsonUtils;
//import com.alibaba.fastjson.JSON;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.io.File;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Component
//public class DataInitializer implements CommandLineRunner {
//    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
//
//    @Autowired
//    private IUserService userService;
//    @Autowired
//    private IRoleService roleService;
//    @Autowired
//    private IPermissionService permissionService;
//    @Autowired
//    private IMenuService menuService;
//    @Autowired
//    private ILangService langService;
//    @Autowired
//    private II18Service i18Service;
//    @Override
//    public void run(String... args) throws Exception {
//        File lockFile = new File("data/lock");
//        if (lockFile.exists()) {
//            logger.warn("Lock file exists, if you want init again, please remove data/lock");
//            return;
//        }
//
//        // 初始化国际化信息
//        initI18n();
//
//        // 初始化权限
//        initPermissions();
//
//        // 初始化菜单
//        initMenus();
//
//        // 初始化角色
//        Role role = initRole();
//
//        // 初始化用户
//        initUser(role);
//
//        // 创建锁文件
//        lockFile.getParentFile().mkdirs();
//        Files.createFile(lockFile.toPath());
//    }
//
//    private void initI18n() throws IOException {
//        String i18nFilePath = this.getClass().getClassLoader().getResource("locales.json").getPath();
//        if (i18nFilePath.startsWith("/")) {
//            i18nFilePath = i18nFilePath.substring(1);
//        }
//        Map<String, Map<String, String>> i18nData = JsonUtils.readJsonFile(i18nFilePath);
//        List<I18> i18List = new ArrayList<>();
//
//        // 遍历外层 Map
//        for (Map.Entry<String, Map<String, String>> outerEntry : i18nData.entrySet()) {
//            String langName = outerEntry.getKey(); // 外层键作为 Lang 的 name
//            Lang lang = new Lang();
//            lang.setName(langName);
//
//            // 遍历内层 Map
//            for (Map.Entry<String, String> innerEntry : outerEntry.getValue().entrySet()) {
//                String key = innerEntry.getKey(); // 内层键
//                String content = innerEntry.getValue(); // 内层值
//                // 创建 I18 对象
//                I18 i18 = new I18();
//                i18.setKey(key);
//                i18.setContent(content);
//                i18List.add(i18);
//            }
//            // 将 I18 对象列表设置到 Lang 对象中
//            lang.setI18(i18List);
//            // 先保存 Lang 对象，生成 id
//            // 保存 I18 对象
//            i18Service.saveBatch(i18List);
//            // 清空 I18 列表，为下一个 Lang 准备
//            i18List.clear();
//        }
//    }
//    private void initPermissions() {
//        Map<String, String[]> permissions = new HashMap<>();
//        permissions.put("user", new String[]{"add", "remove", "update", "query", "password::force-update"});
//        permissions.put("permission", new String[]{"add", "remove", "update", "get"});
//        permissions.put("role", new String[]{"add", "remove", "update", "query"});
//        permissions.put("menu", new String[]{"add", "remove", "update", "query"});
//        permissions.put("i18n", new String[]{"add", "remove", "update", "query"});
//        permissions.put("lang", new String[]{"add", "remove", "update", "query"});
//
//        Permission superPermission = new Permission();
//        superPermission.setName("*");
//        superPermission.setDesc("super permission");
//        try {
//            permissionService.create(superPermission);
//        } catch (Exception e) {
//            logger.error(e.getMessage());
//            logger.error("Please clear the database and try again");
//            System.exit(-1);
//        }
//
//        for (Map.Entry<String, String[]> entry : permissions.entrySet()) {
//            String module = entry.getKey();
//            String[] actions = entry.getValue();
//            for (String action : actions) {
//                Permission permission = new Permission();
//                permission.setName(module + "::" + action);
//                permission.setDesc("");
//                try {
//                    permissionService.create(permission);
//                } catch (Exception e) {
//                    logger.error(e.getMessage());
//                    logger.error("Please clear the database and try again");
//                    System.exit(-1);
//                }
//            }
//        }
//    }
//
//    private void initMenus() throws IOException {
//        List<Menu> menuData = getMenuData();
//        try {
//            // 1. 查询数据库中已存在的菜单名称
//            List<String> existingMenuNames = menuService.lambdaQuery()
//                    .select(Menu::getName)
//                    .list()
//                    .stream()
//                    .map(Menu::getName)
//                    .collect(Collectors.toList());
//
//            // 2. 过滤出数据库中不存在的菜单（基于名称比对）
//            List<Menu> newMenus = menuData.stream()
//                    .filter(menu -> !existingMenuNames.contains(menu.getName()))
//                    .collect(Collectors.toList());
//
//            // 3. 批量导入新增菜单
//            if (!newMenus.isEmpty()) {
//                boolean success = menuService.saveBatch(newMenus);
//                if (success) {
//                    logger.info("成功导入 " + newMenus.size() + " 个新菜单");
//                } else {
//                    throw new RuntimeException("菜单导入失败");
//                }
//            } else {
//                logger.info("没有新菜单需要导入，数据库已存在所有菜单");
//            }
//
//        } catch (Exception e) {
//            logger.error("菜单导入异常: " + e.getMessage());
//            logger.error("Please clear the database and try again");
//            System.exit(-1);
//        }
//    }
//
//    private List<Menu> getMenuData() throws IOException {
//        String MenuFilePath = this.getClass().getClassLoader().getResource("MenuData.json").getPath();
//        if (MenuFilePath.startsWith("/")){
//            MenuFilePath=MenuFilePath.substring(1);
//        }
//        List<Menu> menuData = JsonUtils.readJsonFiletoMenu(MenuFilePath);
//        return menuData;
//    }
//
//    private Role initRole() {
//        Role role = new Role();
//        role.setName("admin");
//
//        //TODO 获取所有权限 ID
//
//        //TODO 获取所有菜单 ID
//        roleService.save(role);
//        return role;
//    }
//
//    private void initUser(Role role) {
//        User user = new User();
//        user.setEmail("admin@no-reply.com");
//        user.setPassword("admin");
//        user.setName("admin");
//        user.setStatus(1);
//        user = userService.create(user);
//        logger.info("[APP]: create admin user success");
//        logger.info("[APP]: email: {}", user.getEmail());
//        logger.info("[APP]: password: 'admin'");
//        logger.info("Enjoy!");
//    }
//}