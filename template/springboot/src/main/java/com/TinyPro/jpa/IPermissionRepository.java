package com.TinyPro.jpa;

import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface IPermissionRepository extends JpaRepository<Permission, Long> {
     Optional<Permission> findByDesc(String desc);
     Optional<Permission> findByName(String name);
     List<Permission> findAllByName(String name);
     boolean existsByName(String name);
     Page<Permission> findByNameContainingIgnoreCase(String name, Pageable pageable);
     @Query("SELECT p FROM Role r JOIN r.permission p WHERE r.id IN :roleIds")
     List<Permission> findByRoleIdIn(@Param("roleIds") List<Integer> roleIds);
     @Modifying
     @Transactional
     @Query(value = "DELETE FROM role_permission WHERE permission_id = :permissionId", nativeQuery = true)
     void deleteRolePermissionByPermissionId(@Param("permissionId") Long permissionId);
    Page<Permission> findAll(Specification<Permission> spec, Pageable pageable);
}
