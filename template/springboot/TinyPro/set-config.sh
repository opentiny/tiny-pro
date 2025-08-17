#!/bin/bash

# set-config.sh - 设置MySQL和Redis配置并通过环境变量传递给应用

# 默认配置值
MYSQL_HOST=${1:-localhost}
MYSQL_PORT=${2:-3306}
MYSQL_DATABASE=${3:-login}
MYSQL_USERNAME=${4:-root}
MYSQL_PASSWORD=${5:-111111}

REDIS_HOST=${6:-localhost}
REDIS_PORT=${7:-6379}
REDIS_PASSWORD=${8:-}

# 提示用户输入配置（如果运行时不提供参数）
if [ "$#" -eq 0 ]; then
    echo "请输入配置信息（直接回车使用默认值）:"

    read -p "MySQL主机地址 [localhost]: " MYSQL_HOST
    MYSQL_HOST=${MYSQL_HOST:-localhost}

    read -p "MySQL端口 [3306]: " MYSQL_PORT
    MYSQL_PORT=${MYSQL_PORT:-3306}

    read -p "MySQL数据库名 [login]: " MYSQL_DATABASE
    MYSQL_DATABASE=${MYSQL_DATABASE:-login}

    read -p "MySQL用户名 [root]: " MYSQL_USERNAME
    MYSQL_USERNAME=${MYSQL_USERNAME:-root}

    read -p "MySQL密码 [111111]: " MYSQL_PASSWORD
    MYSQL_PASSWORD=${MYSQL_PASSWORD:-111111}

    read -p "Redis主机地址 [localhost]: " REDIS_HOST
    REDIS_HOST=${REDIS_HOST:-localhost}

    read -p "Redis端口 [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}

    read -p "Redis密码 []: " REDIS_PASSWORD
    REDIS_PASSWORD=${REDIS_PASSWORD:-}
fi

# 创建 .env 文件
echo "# MySQL 配置" > .env
echo "MYSQL_HOST=$MYSQL_HOST" >> .env
echo "MYSQL_PORT=$MYSQL_PORT" >> .env
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> .env
echo "MYSQL_USERNAME=$MYSQL_USERNAME" >> .env
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> .env

echo "" >> .env
echo "# Redis 配置" >> .env
echo "REDIS_HOST=$REDIS_HOST" >> .env
echo "REDIS_PORT=$REDIS_PORT" >> .env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env

echo "" >> .env
echo "# Docker Compose 会自动加载这些环境变量" >> .env

echo "配置已生成到 .env 文件:"
echo ""
echo "MySQL 配置:"
echo "  主机: $MYSQL_HOST"
echo "  端口: $MYSQL_PORT"
echo "  数据库: $MYSQL_DATABASE"
echo "  用户名: $MYSQL_USERNAME"
echo "  密码: $MYSQL_PASSWORD"
echo ""
echo "Redis 配置:"
echo "  主机: $REDIS_HOST"
echo "  端口: $REDIS_PORT"
echo "  密码: ${REDIS_PASSWORD:-未设置}"
echo ""
echo "使用方法:"
echo "  docker-compose up -d"
echo ""
echo ".env 文件已创建，环境变量会自动传递给应用容器"

# 生成Spring Boot配置文件（可选）
if [ ! -d "config" ]; then
    mkdir -p config
fi

cat > config/application.yml <<EOF
spring:
  profiles:
    active: dev

app:
  env: development
EOF

cat > src/main/resources/application-dev.yml <<EOF
server:
  port: 3000

spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?allowMultiQueries=true&serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&autoReconnect=true&allowMultiQueries=true&allowPublicKeyRetrieval=true&useSSL=false
    username: ${MYSQL_USERNAME}
    password: ${MYSQL_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      pool-name: HikariCPDatasource
      minimum-idle: 5
      idle-timeout: 180000
      maximum-pool-size: 10
      auto-commit: true
      max-lifetime: 180000
      connection-timeout: 30000

  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT}
    password: ${REDIS_PASSWORD}
    database: 0
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
    timeout: 2000ms

  jpa:
    hibernate:
      ddl-auto: update
    database-platform: org.hibernate.dialect.MySQL8Dialect
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        dialect.storage_engine: innodb
        globally_quoted_identifiers: true
        dialect: org.hibernate.dialect.MySQL8Dialect
      hibernate:
        naming:
          physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl

mybatis-plus:
  mapper-locations: classpath:mappers/*.xml
  type-aliases-package: com.TinyPro.entity.po
  configuration:
    map-underscore-to-camel-case: true
    default-enum-type-handler: org.apache.ibatis.type.EnumOrdinalTypeHandler

jwt:
  secret: 0Zi4SA==

reject:
  start: false
EOF

echo ""
echo "Spring Boot 配置文件已生成到 config/ 目录"
echo "包含所有您的自定义配置项"