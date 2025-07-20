package com.TinyPro.service.jpa;

import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface IRoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);
}
