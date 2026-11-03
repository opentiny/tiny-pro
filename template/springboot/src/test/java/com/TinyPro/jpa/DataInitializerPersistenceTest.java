package com.TinyPro.jpa;

import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.profiles.active=test",
    "spring.datasource.url=jdbc:h2:mem:tinypro;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.jpa.properties.hibernate.globally_quoted_identifiers=true"
})
class DataInitializerPersistenceTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private IPermissionRepository permissionRepository;

    @Autowired
    private IRoleRepository roleRepository;

    @Autowired
    private IUserRepository userRepository;

    @Test
    void recreatesDefaultUserWhenExistingAdminRoleIsDetached() {
        Permission superPermission = new Permission();
        superPermission.setName("*");
        superPermission.setDesc("super permission");
        permissionRepository.saveAndFlush(superPermission);

        Role adminRole = new Role();
        adminRole.setName("admin");
        adminRole.setPermission(new HashSet<>(List.of(superPermission)));
        adminRole.setMenus(new HashSet<>());
        roleRepository.saveAndFlush(adminRole);

        User defaultAdmin = newUser("admin@no-reply.com", adminRole);
        userRepository.saveAndFlush(defaultAdmin);
        userRepository.deleteById(defaultAdmin.getId().longValue());
        userRepository.flush();
        assertEquals(0, userRepository.count());

        entityManager.clear();
        Role existingRole = roleRepository.findFirstByNameOrderByIdAsc("admin").orElseThrow();
        entityManager.clear();

        User recreatedAdmin = newUser("admin@no-reply.com", existingRole);
        assertDoesNotThrow(() -> userRepository.saveAndFlush(recreatedAdmin));
        assertEquals(1, userRepository.count());
    }

    private User newUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setName("admin");
        user.setStatus(1);
        user.setRole(List.of(role));
        return user;
    }
}
