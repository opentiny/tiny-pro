# ===== 第一阶段：构建阶段，使用 Maven 打包项目 =====
FROM maven:3.9-eclipse-temurin-17 AS build

# 设置工作目录
WORKDIR /app

# 复制整个项目文件到容器中
COPY . .

# 执行 Maven 打包命令（跳过测试）
RUN mvn clean package -DskipTests

# ===== 第二阶段：运行阶段，仅使用 JRE 运行 JAR =====
FROM eclipse-temurin:17-jre-jammy

# 设置工作目录
WORKDIR /app

# 从构建阶段拷贝打包好的 jar 文件（假设你的项目打包后是 target/*.jar）
# 通常 Spring Boot 项目默认打包出的 jar 是：target/项目名-版本号.jar
COPY --from=build /app/target/TinyPro-1.0-SNAPSHOT.jar app.jar

# 暴露应用端口（根据你的 Spring Boot 配置，比如 8080）
EXPOSE 3000

# 启动 Spring Boot 应用
ENTRYPOINT ["java", "-jar", "app.jar"]