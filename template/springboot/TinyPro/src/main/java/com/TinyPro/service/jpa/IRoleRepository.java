package com.TinyPro.service.jpa;

import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface IRoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    @Modifying
    @Transactional
    @Query(value = "DELETE rm FROM role_menu rm JOIN menu m ON rm.menu_id = m.id WHERE m.id = :menuId",
            nativeQuery = true)
    void deleteByMenuId(@Param("menuId") Integer menuId);

    @EntityGraph(attributePaths = {"menus"})  // 只加载 menus
    @Query("select r from Role r")
    Page<Role> findAllWithMenus(Specification<Role> spec, Pageable pageable);
}
