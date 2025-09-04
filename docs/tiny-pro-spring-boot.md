# tiny-pro-spring-boot.md

# TinyPro 后端开发指南

在阅读本指南前，我们假设您已经阅读过[Springboot官方文档]([Spring Boot](https://spring.io/projects/spring-boot))并能够独立本机启动`MySQL`与`Redis`的能力。

## 项目初始化

[快速开始](./tiny-pro.md)

## 后端启动

开发阶段通常不会使用docker进行启动，更多的是本地启动。首先我们要配置环境变量文件, 也就是`application.properties`文件.

```properties
# ====================== 服务基本配置 ======================

# 设置 Spring Boot 应用启动后监听的端口号为 3000
# 即你可以通过 http://localhost:3000 访问你的服务
server.port=3000

# ====================== 数据库连接配置（MySQL）======================

# 数据库连接URL：连接到本地 MySQL 服务，数据库名为 login，端口 3306
# 参数说明：
# - allowMultiQueries=true：允许一条SQL语句中包含多个查询（比如多个SELECT）
# - serverTimezone=GMT%2B8：设置服务器时区为东八区（北京时间），%2B 是URL编码的 +
# - useUnicode=true&characterEncoding=utf8：使用 Unicode 和 UTF-8 编码，防止中文乱码
# - autoReconnect=true：连接异常时自动尝试重连
# - allowPublicKeyRetrieval=true：允许客户端获取服务端公钥（MySQL 8+ 可能需要，解决某些认证问题）
# - useSSL=false：不启用 SSL 加密（开发环境常用，生产环境建议开启）
spring.datasource.url=jdbc:mysql://localhost:3306/login?allowMultiQueries=true&serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&autoReconnect=true&allowMultiQueries=true&allowPublicKeyRetrieval=true&useSSL=false

# 数据库用户名，通常是安装 MySQL 时的默认超级用户
spring.datasource.username=root

# 数据库密码，生产环境中请务必修改为复杂密码，并不要直接写在代码中！
spring.datasource.password=111111

# 指定使用的 JDBC 驱动类，这里是 MySQL 8 的驱动类
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ====================== HikariCP 连接池配置（高性能连接池，默认使用）======================

# 连接池的名称，用于监控和日志中识别
spring.datasource.hikari.pool-name=HikariCPDatasource

# 连接池中保持的最小空闲连接数，即使没有请求也会维持这么多连接
spring.datasource.hikari.minimum-idle=5

# 空闲连接的超时时间（毫秒），超过这个时间空闲连接会被释放，默认是 10 分钟，这里设为 3 分钟 (180000ms)
spring.datasource.hikari.idle-timeout=180000

# 连接池中允许的最大连接数，控制同时能从池中拿出的最大连接数量
spring.datasource.hikari.maximum-pool-size=10

# 是否自动提交事务，默认为 true；可根据业务需求调整
spring.datasource.hikari.auto-commit=true

# 连接的最大存活时间（毫秒），超时后会被销毁并新建，这里设为 3 分钟
spring.datasource.hikari.max-lifetime=180000

# 连接超时时间（毫秒），即从池中获取一个连接的最长等待时间，超时将抛出异常
spring.datasource.hikari.connection-timeout=30000

# ====================== MyBatis-Plus 配置（ORM 框架）======================

# 指定 MyBatis-Plus 的 Mapper XML 文件所在的位置，这里放在 resources/mappers/ 目录下
mybatis-plus.mapper-locations=classpath:mappers/*.xml

# 指定实体类（POJO）所在的包路径，MyBatis-Plus 会为这些类创建别名，简化 XML 中的引用
mybatis-plus.type-aliases-package=com.TinyPro.entity.po

# 开启数据库字段下划线转驼峰命名规则，例如数据库字段 user_name 会映射为 Java 属性 userName
mybatis-plus.configuration.map-underscore-to-camel-case=true

# 设置 MyBatis 枚举类型处理器为 EnumOrdinalTypeHandler，即存储枚举的 ordinal（序号）而非 name
mybatis-plus.configuration.default-enum-type-handler=org.apache.ibatis.type.EnumOrdinalTypeHandler

# ====================== JPA / Hibernate 配置（可选，如果你同时用了 JPA）======================

# Hibernate 自动更新数据库表结构（根据实体类变化自动调整表，开发环境可用，生产环境慎用！）
# 可选值：none, validate, update, create, create-drop
spring.jpa.hibernate.ddl-auto=update

# 指定数据库方言为 MySQL 8，确保 Hibernate 生成符合 MySQL 8 的 SQL
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# 再次明确指定 Hibernate 使用的 MySQL 方言（与上面一样，有些版本可能需要）
spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.MySQL8Dialect

# 指定使用 InnoDB 存储引擎（MySQL 常用引擎，支持事务等高级功能）
spring.jpa.properties.hibernate.dialect.storage_engine=innodb

# 是否对所有标识符（如表名、字段名）使用全局引号包裹，一般保持 false 即可，某些特殊场景可能需要
spring.jpa.properties.hibernate.globally_quoted_identifiers=true

# 指定 Hibernate 的物理命名策略为标准的（不对表名/字段名做任何转换）
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl

# ====================== JWT 配置（JSON Web Token，用于身份认证）======================

# JWT 密钥，用于对 Token 进行签名和验证，生产环境一定要使用复杂且保密的密钥！
# 这里是示例值 "0Zi4SA=="
jwt.secret=0Zi4SA==

# ====================== Redis 配置（缓存/会话等）======================

# Redis 服务器主机地址，这里为本机
spring.data.redis.host=localhost

# Redis 服务端口，默认是 6379
spring.data.redis.port=6379

# 表示是否开启展示模式，默认为 true
reject.start=true
```

### 开发前检查清单

- [ ] 后端项目已被初始化
- [ ] `application.properties`文件中`server.port`**是开发环境**
- [ ] `application.properties`文件中`spring.datasource`为开发库的配置
- [ ] application.properties文件中`spring.data.redis`**是开发环境**
- [ ] MySQL服务可以正常访问
- [ ] Redis服务可以正常访问
- [ ] `data`目录被删除 (可选,如果你不需要测试初始化数据的话)

配置好文件后您可以运行`mvn spring-boot:run`来运行后端服务。当出现下述字样时，表示后端启动成功。

```
2025-08-29T02:11:32.039+08:00  INFO 19572 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 3000 (http) with context path ''
2025-08-29T02:11:32.060+08:00  INFO 19572 --- [           main] com.TinyPro.TinyProApplication           : Started TinyProApplication in 12.558 seconds (process running for 13.067)
2025-08-29T02:11:32.079+08:00  INFO 19572 --- [           main] com.TinyPro.DataInitializer              : [✅ TEST] MySQL 数据库连接成功！数据库状态正常。
2025-08-29T02:11:33.434+08:00  INFO 19572 --- [           main] com.TinyPro.DataInitializer              : [✅ TEST] Redis 连接成功！缓存服务状态正常。
2025-08-29T02:11:33.435+08:00  WARN 19572 --- [           main] com.TinyPro.DataInitializer              : Lock file exists, if you want init again, please remove data/lock

```

### Docker启动配置

1. 首先要编辑.env（将自己的服务的地址和端口以及一些具体参数的配置写到里面)

```properties
#数据库的链接地址和库
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/tinypro_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
#数据库用户
SPRING_DATASOURCE_USERNAME=root
#数据库密码
SPRING_DATASOURCE_PASSWORD=123456
#redis的地址
SPRING_DATA_REDIS_HOST=redis
#redis的密码
SPRING_DATA_REDIS_PORT=6379
#加密密钥
jwt.secret=0Zi4SA==
#JWT存活时间单位是小时
EXPIRES_IN=1
```

######  对照这个进行配置和使用然后就会覆盖application.properties的以下参数（可以根据自己的环境进行配置.env覆盖）

```properties
#数据库的链接地址和库
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/login?allowMultiQueries=true&serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&autoReconnect=true&allowMultiQueries=true&allowPublicKeyRetrieval=true&useSSL=false}
#数据库用户
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
#数据库密码
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:111111}
#jwt的密钥覆盖
jwt.secret=0Zi4SA==
#redis的地址默认localhost
spring.data.redis.host=${SPRING_DATA_REDIS_HOST:localhost}
#redis的端口
spring.data.redis.port=${SPRING_DATA_REDIS_PORT:6379}
#默认的jwt时间
EXPIRES_IN=1
```

#### 最后的如何启动过程可以看这个快速部署文档

#### [Docker 最全的Docker-compose快速部署](https://developer.aliyun.com/article/914404)

## 初始化数据

有些时候我们需要自动初始化一些数据(比如前端的默认国际化字段). 这些逻辑**均需**写在DataInitializer类里面。

```java
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
```

主要负责对于初始化的修改

## 国际化

> 这里的国际化指的是报错信息的国际化

后端采用的是`spring-context`依赖库。国际化词条放在`resources/i18n/messages_zh_CN或者en_US.properties`下

```
resources
  i18n
    messages_zh_CN.properties
    messages_en_US.properties`
```

目前仅支持`enUS`与`zhCN`两种语言

### 报错时候使用国际化词条

后端服务遵循`Restful`规范，可以直接抛出错误使用HttpStatusCode来代替错误代码。如果需要使用国际化词条，请确保该词条已经存在于``resources/i18n/messages_zh_CN.properties``文件内。假设有一个服务`PolicyService`需要抛出一个`409`错误。

1. 添加国际化词条
2. 在服务中注入`I18nService`
3. 使用该词条

```json
// messages_zh_CN.properties``
policy.exists = Policy已存在

```

```java
package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Employee;

import com.TinyPro.exception.BusinessException;
import com.TinyPro.jpa.IEmployeRepository;
import com.TinyPro.service.IEmployeeService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PolicyService  implements IPolicyService {
    @Autowired
    private IPolicyRepository iPolicyRepository;

    @Override
    public List<Policy> list(List<Long> query) {
        try {
             List<Policy> allById = iPolicyRepository.findAllById(query);
        return allById;
        } catch (Exception e) {
            throw new BusinessException("policy.exists", HttpStatus.CONFLICT,null);//这块就是抛出异常然后由全局异常捕获
        }
    }
```

## 接口权限管理

### Token管理

凡是**没有**被`Public`修饰器修饰的接口，均会被`filter/UserGuardsFilter.java`进行校验，如果**token不存在**、**token过期**、**token不合法**，均不允许访问。

### 权限控制

如果一个接口没有被`PermissionAnnotation`修饰器进行修饰，那么这个接口是**允许**所有**已经登录**的用户访问。如果一个接口**被**`Permission`修饰器进行修饰，那么该接口**仅允许**拥有该权限的用户访问，其余用户会返回**403**错误代码

默认`admin`用户存在超级权限`(*)`, 拥有该权限且已经登陆的用户可以访问任何接口。

例如

```java
@RestController
@RequestMapping("/policy")
public class LangController {
    @Autowired
    private ILangService langService;

    @GetMapping("/list")
    public ResponseEntity<Lang> createLang(@RequestBody @Valid CreateLangDto createLangDto) {
        return this.langService.create(createLangDto);
    }

```

上述代码中`GET /policy/list`是一个不公开，不受保护的接口。我们可以使用`PermissionAnnotation`修饰器对他进行权限认证，当且仅当用户角色存在`policy::get::list`权限时才放行

```java
@RestController
@RequestMapping("/policy")
public class LangController {
    @Autowired
    private ILangService langService;

    @GetMapping("/list")
     @PermissionAnnotation("policy::get::list")
    public ResponseEntity<Lang> createLang(@RequestBody @Valid CreateLangDto createLangDto) {
        return this.langService.create(createLangDto);
    }
```

这样一来`GET /policy/list`就只允许拥有`policy::get::list`权限的角色访问，其余角色访问则会返回一个403错误

但有些时候我们需要一个接口允许未登陆的用户访问。例如我们在登陆的时候经常需要获取免责声明，那么我们就可以写一个`GET /policy`接口，用于获取一个免责声明的法律条文。

所以我们可以添加如下

```java
@RestController
@RequestMapping("/policy")
public class LangController {
    @Autowired
    private ILangService langService;

    @GetMapping("/list")
    @PermissionAnnotation("policy::get::list")
    public ResponseEntity<Lang> createLang(@RequestBody @Valid CreateLangDto createLangDto) {
        return this.langService.create(createLangDto);
    }
     @IsPublic()
    @GetMapping("/list")
     public ResponseEntity<Lang> createLang(@RequestBody @Valid CreateLangDto createLangDto) {
        return this.langService.create(createLangDto);
    }
```

这样一来`GET /policy/list`接口只允许**登录**且**拥有policy::get::list**权限的角色访问。`GET /policy`接口则允许**未登陆**的**所有角色**进行访问。

如果未来的某一天，我们需要让`/policy/*`都允许未登录的用户访问，那么我们可以这么写

```java
@IsPublic()
@RestController
@RequestMapping("/policy")
public class LangController {
    @Autowired
    private ILangService langService;

    @GetMapping("/list")
    @PermissionAnnotation("policy::get::list")
    public ResponseEntity<Lang> createLang(@RequestBody @Valid CreateLangDto createLangDto) {
        return this.langService.create(createLangDto);
    }
```

这样一来，所有的policy接口都可以被未登录的用户访问了

## 当出现messages_zh_CN.properties(编码问题)

点击File -> settings -> File Encodings -> 选择UTF-8和with BOM under Windows, with no BOM otherwise这个选项，做到全局的UTF-8的配置

1. 点击Settings

<img src=".\images\image-20250901183132738.png" alt="image-20250901190434427" style="zoom:50%;" />

2. 搜索File Encodings(选择对应的选项)

<img src=".\images\image-20250901210454281.png" alt="image-20250901190522736" style="zoom: 50%;" />

## 遇到困难?

加官方小助手微信 opentiny-official，加入技术交流群

## 常见问题

### 提示 `Lock file exists, if you want init agin, please remove dist or dist/lock`

为了避免重复初始化，系统会在第一次初始化的时候在`data`目录下新建`lock`文件，如果您需要再次初始化，那么请您删除`data/lock`或者直接删除`data`文件夹
