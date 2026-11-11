package com.TinyPro.migration;

import com.TinyPro.DataInitializer;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Verifies the V1-V3 historical schema plus legacy menu data upgrade path.
 * This test requires the MySQL database configured by migration-test.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("migration-test")
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none"
})
class MenuMigrationUpgradeTest {

    @MockBean
    private DataInitializer dataInitializer;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void prepareLegacyDatabase() {
        flyway().clean();
        flyway("3").migrate();

        jdbcTemplate.update("""
                INSERT INTO `role` (`id`, `name`)
                VALUES (1, 'admin'), (2, 'content-editor')
                """);
        jdbcTemplate.update("""
                INSERT INTO `menu`
                (`id`, `name`, `order`, `parentId`, `menuType`, `icon`, `component`, `path`, `locale`)
                VALUES
                  (10, 'Form', 3, NULL, 'normal', '', 'form/index', 'form', 'menu.form'),
                  (30, 'Editor', 3, 10, 'normal', '', 'form/editor/index', 'editor', 'menu.form.editor'),
                  (31, 'Editor', 3, 10, 'normal', '', 'orm/editor/index', 'editor', 'menu.editor.old'),
                  (40, 'Draft', 1, 30, 'normal', '', 'form/editor/create/index', 'create', 'menu.form.editor.create'),
                  (41, 'Draft', 1, 31, 'normal', '', 'form/editor/create/index', 'create', 'menu.form.editor.create'),
                  (42, 'DraftSection', 1, 41, 'normal', '', 'form/editor/create/section/index', 'section', 'menu.form.editor.section')
                """);
        jdbcTemplate.update("""
                INSERT INTO `role_menu` (`role_id`, `menu_id`)
                VALUES (2, 10), (2, 31), (2, 41), (2, 42)
                """);
    }

    @Test
    void preservesLegacyEditorPermissionsAndChildrenDuringUpgrade() {
        flyway().migrate();

        Integer oldEditorCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `menu` WHERE `id` = 31", Integer.class);
        Integer draftCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `menu` WHERE `id` = 40", Integer.class);
        Integer oldDraftCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `menu` WHERE `id` = 41", Integer.class);
        Integer editorPermissionCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `role_menu` WHERE `role_id` = 2 AND `menu_id` = 30",
                Integer.class);
        Integer oldPermissionCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `role_menu` WHERE `role_id` = 2 AND `menu_id` = 31",
                Integer.class);
        Integer draftPermissionCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `role_menu` WHERE `role_id` = 2 AND `menu_id` = 40",
                Integer.class);
        Integer descendantPermissionCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `role_menu` WHERE `role_id` = 2 AND `menu_id` = 42",
                Integer.class);
        Integer descendantParentId = jdbcTemplate.queryForObject(
                "SELECT `parentId` FROM `menu` WHERE `id` = 42", Integer.class);

        assertEquals(0, oldEditorCount);
        assertEquals(1, draftCount);
        assertEquals(0, oldDraftCount);
        assertEquals(1, editorPermissionCount);
        assertEquals(0, oldPermissionCount);
        assertEquals(1, draftPermissionCount);
        assertEquals(1, descendantPermissionCount);
        assertEquals(40, descendantParentId);
    }

    private Flyway flyway() {
        return flyway(null);
    }

    private Flyway flyway(String target) {
        var configuration = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .cleanDisabled(false);
        if (target != null) {
            configuration.target(target);
        }
        return configuration.load();
    }
}
