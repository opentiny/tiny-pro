package com.TinyPro.jpa;

import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IPermissionRepository extends JpaRepository<Permission, Long> {
     Optional<Permission> findByDesc(String desc);
     Optional<Permission> findByName(String name);
     Page<Permission> findByNameContainingIgnoreCase(String name, Pageable pageable);
     @Query("SELECT p FROM Role r JOIN r.permission p WHERE r.id IN :roleIds")
     List<Permission> findByRoleIdIn(@Param("roleIds") List<Integer> roleIds);
}
