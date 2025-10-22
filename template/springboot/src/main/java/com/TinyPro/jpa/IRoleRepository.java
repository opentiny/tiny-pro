package com.TinyPro.jpa;

import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface IRoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    List<Role> findAllById(Iterable<Long> ids);

    @Modifying
    @Transactional
    @Query(value = "DELETE rm FROM role_menu rm JOIN menu m ON rm.menu_id = m.id WHERE m.id = :menuId",
            nativeQuery = true)
    void deleteByMenuId(@Param("menuId") Integer menuId);
    @EntityGraph(attributePaths = {"menus", "permission"})
    Page<Role> findAll(Specification<Role> spec, Pageable pageable);
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.menus WHERE r.id IN :ids")
    List<Role> findAllWithMenusByIds(@Param("ids") List<Integer> ids);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permission WHERE r.id IN :ids")
    List<Role> findAllWithPermissionsByIds(@Param("ids") List<Integer> ids);

}
