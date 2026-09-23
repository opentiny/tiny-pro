package com.TinyPro.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HealthCheckControllerTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private RedisConnectionFactory redisConnectionFactory;

    @Test
    void returnsSuccessWhenDatabaseAndRedisAreAvailable() throws Exception {
        Connection databaseConnection = mock(Connection.class);
        RedisConnection redisConnection = mock(RedisConnection.class);
        when(dataSource.getConnection()).thenReturn(databaseConnection);
        when(databaseConnection.isValid(2)).thenReturn(true);
        when(redisConnectionFactory.getConnection()).thenReturn(redisConnection);

        HealthCheckController controller = new HealthCheckController(dataSource, redisConnectionFactory);

        var response = controller.healthCheck();

        assertEquals(200, response.getStatusCode().value());
        assertEquals("success", response.getBody());
    }
}
