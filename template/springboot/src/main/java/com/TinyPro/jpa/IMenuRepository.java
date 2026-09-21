package com.TinyPro.jpa;

import com.TinyPro.entity.po.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface IMenuRepository extends JpaRepository<Menu, Long> {
    @Query(value = "SELECT m.* FROM menu m " +
            "JOIN role_menu rm ON m.id = rm.menu_id " +
            "WHERE rm.role_id IN :roleIds",
            nativeQuery = true)
    List<Menu> findMenusByRoleIds(@Param("roleIds") Set<Integer> roleIds);
    // 查询所有菜单
    @Query("SELECT m FROM Menu m ORDER BY m.order ASC")
    List<Menu> findAllMenus();
    Optional<Menu> findByName(String name);
    @Query("""
            SELECT m FROM Menu m
            WHERE m.name = :name
              AND m.order = :menuOrder
              AND m.menuType = :menuType
              AND ((m.parentId = :parentId) OR (m.parentId IS NULL AND :parentId IS NULL))
              AND ((m.path = :path) OR (m.path IS NULL AND :path IS NULL))
              AND ((m.icon = :icon) OR (m.icon IS NULL AND :icon IS NULL))
              AND ((m.component = :component) OR (m.component IS NULL AND :component IS NULL))
              AND ((m.locale = :locale) OR (m.locale IS NULL AND :locale IS NULL))
            """)
    Optional<Menu> findByMenuIdentity(
            @Param("name") String name,
            @Param("menuOrder") Integer order,
            @Param("menuType") String menuType,
            @Param("parentId") Integer parentId,
            @Param("path") String path,
            @Param("icon") String icon,
            @Param("component") String component,
            @Param("locale") String locale
    );
    Optional<Menu> findFirstByNameOrderByIdAsc(String name);
    List<Menu> findByParentId(Integer parentId);
}
