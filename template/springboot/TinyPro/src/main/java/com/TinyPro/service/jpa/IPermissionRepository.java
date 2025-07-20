package com.TinyPro.service.jpa;

import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface IPermissionRepository extends JpaRepository<Permission, Long> {
     Optional<Permission> findByDesc(String desc);
}
