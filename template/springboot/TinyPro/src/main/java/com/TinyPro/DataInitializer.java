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
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
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

    @Override
    public void run(String... args) throws Exception {
        File lockFile = new File("data/lock");
        if (lockFile.exists()) {
            logger.warn("Lock file exists, if you want init again, please remove data/lock");
            return;
        }

        // 初始化国际化信息
        initI18n();

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
            // 遍历外层 Map
            for (Map.Entry<String, Map<String, String>> outerEntry : i18nData.entrySet()) {
                String langName = outerEntry.getKey(); // 外层键作为 Lang 的 name
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

    private void initPermissions() {
        Map<String, String[]> permissions = new HashMap<>();
        permissions.put("user", new String[]{"add", "remove", "update", "query", "password::force-update"});
        permissions.put("permission", new String[]{"add", "remove", "update", "get"});
        permissions.put("role", new String[]{"add", "remove", "update", "query"});
        permissions.put("menu", new String[]{"add", "remove", "update", "query"});
        permissions.put("i18n", new String[]{"add", "remove", "update", "query"});
        permissions.put("lang", new String[]{"add", "remove", "update", "query"});

        Permission superPermission = new Permission();
        superPermission.setName("*");
        superPermission.setDesc("super permission");
        try {
            permissionRepository.save(superPermission);
        } catch (Exception e) {
            logger.error(e.getMessage());
            logger.error("Please clear the database and try again");
            System.exit(-1);
        }

        for (Map.Entry<String, String[]> entry : permissions.entrySet()) {
            String module = entry.getKey();
            String[] actions = entry.getValue();
            for (String action : actions) {
                Permission permission = new Permission();
                permission.setName(module + "::" + action);
                permission.setDesc("");
                try {
                    permissionRepository.save(permission);
                } catch (Exception e) {
                    logger.error(e.getMessage());
                    logger.error("Please clear the database and try again");
                    System.exit(-1);
                }
            }
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
        Role role = new Role();
        role.setName("admin");

        Set<Permission> permissions = permissionRepository.findByDesc("super permission")
                .stream()
                .collect(Collectors.toSet());  // Java 17+ 不可变列表

        role.setPermission(permissions);

        Set<Menu> all = menuRepository.findAll().stream().collect(Collectors.toSet());
        role.setMenus(all);
        roleRepository.save(role);
        return role;
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
        Optional<Role> optionalRole = roleRepository.findByName(Contants.ADMIN);
        Role adminRole = optionalRole.get();
        List<Role> roleList = List.of(adminRole);
        user.setRole(roleList);
        user = userRepository.save(user);
        logger.info("[APP]: create admin user success");
        logger.info("[APP]: email: {}", user.getEmail());
        logger.info("[APP]: password: 'admin'");
        logger.info("Enjoy!");
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
