# SpringBoot profile configuration

The application no longer keeps database, Redis, or JWT credentials in the common configuration.

## Local development

Start with the local profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
CLI 生成的项目环境变量配置会写入 local 文件，直接运行源码模板则需要额外设置环境变量：
启动之前，请先在本地 MySQL 中创建数据库，并在 src/main/resources/application-local.yml 中配置数据库用户名和密码。
如果是在ide中运行，可以在 Run/Debug Configurations 中的 Environment variables 添加环境变量：
MYSQL_USERNAME=root;
REDIS_HOST=localhost;
REDIS_PASSWORD=(你的redis密码，没有可以不用配置）;
JWT_SECRET=你的jwt秘钥;
MYSQL_PASSWORD=你的数据库密码


