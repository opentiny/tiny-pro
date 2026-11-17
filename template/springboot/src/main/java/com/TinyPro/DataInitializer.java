package com.TinyPro;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.InitMenuDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.po.Editor;
import com.TinyPro.entity.po.EditorMember;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.TinyPro.jpa.ApplicationRepository;
import com.TinyPro.jpa.EditorMemberRepository;
import com.TinyPro.jpa.EditorRepository;
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
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {
  private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

  @Autowired
  private DataSource dataSource;

  @Autowired
  private RedisConnectionFactory redisConnectionFactory;
  @Autowired
  private IUserRepository userRepository;
  @Autowired
  private EditorRepository editorRepository;
  @Autowired
  private EditorMemberRepository editorMemberRepository;
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
  @Transactional
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

    boolean freshDatabase = isFreshDatabase();

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
    if (freshDatabase) {
      initUser(role);
    } else {
      logger.info("[APP]: Existing database detected; skip default admin bootstrap");
    }
    initEditorDocuments();
    redisUtil.setPersistentValue(Contants.INSTALL_FLAG, "1");
    logger.info("[APP]: installation flag persisted: {}", Contants.INSTALL_FLAG);
  }

  /**
   * Redis and MySQL can be restored independently. Do not trust the Redis
   * installation marker unless the database still contains the static seed
   * data required by the application. The check intentionally does not require
   * the default account; deleting the default admin must not recreate it on the
   * next restart.
   */
  private boolean requiredSeedDataExists() {
    return permissionRepository.existsByName(Contants.ADMIN_SUPE_POWER)
      && roleRepository.findFirstByNameOrderByIdAsc(Contants.ADMIN).isPresent()
      && menuRepository.count() > 0
      && langRepository.count() > 0
      && i18Repository.count() > 0
      && applicationRepository.count() > 0
      && editorRepository.count() > 0
      && editorMemberRepository.count() > 0;
  }

  /**
   * The default account is a first-install bootstrap only. A database that
   * already contains any application data may have intentionally removed the
   * default account, so it must never be treated as a fresh installation.
   */
  private boolean isFreshDatabase() {
    return userRepository.count() == 0
      && roleRepository.count() == 0
      && permissionRepository.count() == 0
      && menuRepository.count() == 0
      && langRepository.count() == 0
      && i18Repository.count() == 0
      && applicationRepository.count() == 0
      && editorRepository.count() == 0
      && editorMemberRepository.count() == 0;
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
    permissions.put("employee", new String[]{"add", "remove", "update"});

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

    Role persisted = roleRepository.findFirstByNameOrderByIdAsc(Contants.ADMIN).orElse(null);
    if (persisted != null) {
      return persisted;
    }

    Role role = new Role();
    role.setName(Contants.ADMIN);
    role.setPermission(new HashSet<>(List.of(superPermission)));
    role.setMenus(new HashSet<>(menuRepository.findAll()));
    return roleRepository.saveAndFlush(role);
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

  private void initEditorDocuments() {
    List<Editor> normalDocuments = List.of(
      editorSeed(
        "云平台数据库联调记录",
        "云平台部",
        LocalDateTime.of(2026, 11, 3, 9, 40),
        "<h2>云平台数据库联调记录</h2><p>本次联调完成了员工、项目和文档接口的数据库持久化验证。</p><ul><li>所有列表均读取 MySQL</li><li>新增与修改操作重启后保留</li></ul>"
      ),
      editorSeed(
        "企业工作台验收清单",
        "前端技术部",
        LocalDateTime.of(2026, 11, 5, 15, 20),
        "<h2>企业工作台验收清单</h2><ol><li>检查监控空数据状态</li><li>检查表格筛选与分页</li><li>检查编辑器自动保存</li></ol>"
      ),
      editorSeed(
        "质量网关发布说明",
        "质量保障部",
        LocalDateTime.of(2026, 11, 8, 18, 0),
        "<h2>质量网关 V1.6</h2><p>新增接口覆盖率看板与发布前自动巡检能力。</p>"
      )
    );

    for (Editor document : normalDocuments) {
      saveEditorIfAbsent(document);
    }

    List<Editor> collaborationDocuments = List.of(
      editorSeed(
        "云资源平台迭代周稿",
        "云资源部",
        LocalDateTime.of(2026, 11, 6, 10, 15),
        "<h2>云资源平台迭代</h2><p>请各负责人每日更新接口联调和数据准备进度。</p>"
      ),
      editorSeed(
        "设计资产中心评审纪要",
        "设计中心",
        LocalDateTime.of(2026, 11, 7, 14, 50),
        "<h2>评审结论</h2><p>统一资产分类与检索字段，下一版本补充批量管理能力。</p>"
      ),
      editorSeed(
        "质量门禁接入方案",
        "质量保障部",
        LocalDateTime.of(2026, 11, 9, 11, 30),
        "<h2>接入方案</h2><p>先覆盖核心读写接口，再逐步接入全量页面巡检。</p>"
      )
    );

    List<User> collaborationUsers = userRepository.findAll();
    for (Editor document : collaborationDocuments) {
      Editor savedDocument = saveEditorIfAbsent(document);
      for (User user : collaborationUsers) {
        if (!editorMemberRepository.existsByEditorIdAndUserId(savedDocument.getId(), user.getId())) {
          EditorMember member = new EditorMember();
          member.setEditorId(savedDocument.getId());
          member.setUserId(user.getId());
          editorMemberRepository.save(member);
        }
      }
    }
  }

  private Editor editorSeed(String name, String department, LocalDateTime time, String content) {
    Editor editor = new Editor();
    editor.setName(name);
    editor.setDepartment(department);
    editor.setTime(time);
    editor.setContent(content);
    return editor;
  }

  private Editor saveEditorIfAbsent(Editor editor) {
    return editorRepository.findFirstByNameOrderByIdAsc(editor.getName())
      .orElseGet(() -> editorRepository.saveAndFlush(editor));
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
