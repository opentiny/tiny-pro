# ===== 第一阶段：构建阶段，使用 Maven 打包项目 =====
FROM maven:3.9-eclipse-temurin-17 AS build

# 设置工作目录
WORKDIR /app

# 复制项目文件和 Maven 配置
COPY . .
COPY settings.xml /root/.m2/settings.xml

# 执行打包（跳过测试）
RUN mvn clean package -DskipTests

# ===== 第二阶段：运行阶段，使用更小的 JRE Alpine 镜像 =====
FROM eclipse-temurin:17-jre-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段拷贝最终的 jar 包
COPY --from=build /app/target/TinyPro-1.0-SNAPSHOT.jar app.jar

# 暴露端口（根据你的 application.properties 中 server.port）
EXPOSE 3000

# 启动 Spring Boot 应用
ENTRYPOINT ["java", "-jar", "app.jar"]