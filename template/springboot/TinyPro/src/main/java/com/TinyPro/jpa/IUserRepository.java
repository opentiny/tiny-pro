package com.TinyPro.jpa;

import com.TinyPro.entity.po.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Long> , JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByRoleId(Long roleId);
    @Modifying
    void deleteByRoleId(Long roleId);
    @Query("SELECT u FROM User u JOIN u.role r WHERE r.id = :roleId")
    List<User> findByRoleId(@Param("roleId") Long roleId);
    // 使用 JOIN FETCH 加载 roles
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.role WHERE u.id = :userId")
    Optional<User> findByIdWithRoles(@Param("userId") Integer userId);
}
