package com.TinyPro.migration;

import com.TinyPro.DataInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("migration-test")
class FlywayMigrationTest {

    // Prevent the application seed runner from requiring Redis during migration validation.
    @MockBean
    private DataInitializer dataInitializer;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void appliesAllFlywayMigrationsAndLeavesSchemaValid() {
        Integer migrationCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1",
                Integer.class
        );

        assertEquals(4, migrationCount);
    }
}
