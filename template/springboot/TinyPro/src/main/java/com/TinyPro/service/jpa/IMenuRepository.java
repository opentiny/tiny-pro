package com.TinyPro.service.jpa;

import com.TinyPro.annotation.Permission;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Role;
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
    Optional<Menu> findByNameAndOrderAndMenuTypeAndParentIdAndPathAndIconAndComponentAndLocale(
            String name,
            Integer order,
            String menuType,
            Integer parentId,
            String path,
            String icon,
            String component,
            String locale
    );
    List<Menu> findByParentId(Integer parentId);
}
