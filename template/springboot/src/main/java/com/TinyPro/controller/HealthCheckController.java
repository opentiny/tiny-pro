package com.TinyPro.controller;

import com.TinyPro.annotation.IsPublic;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

@RestController
@RequestMapping("/healthCheck")
public class HealthCheckController {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    public HealthCheckController(
            DataSource dataSource,
            RedisConnectionFactory redisConnectionFactory
    ) {
        this.dataSource = dataSource;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @IsPublic
    @GetMapping
    @Operation(summary = "健康检查", description = "检查应用、MySQL 和 Redis 是否可用")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "服务正常，返回 success"),
            @ApiResponse(responseCode = "503", description = "MySQL 或 Redis 不可用")
    })
    public ResponseEntity<String> healthCheck() {
        try {
            checkDatabase();
            checkRedis();
            return ResponseEntity.ok("success");
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("unhealthy");
        }
    }

    private void checkDatabase() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            if (!connection.isValid(2)) {
                throw new IllegalStateException("Database connection is invalid");
            }
        }
    }

    private void checkRedis() {
        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            connection.ping();
        }
    }
}
