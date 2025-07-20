package com.TinyPro.service.jpa;

import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.po.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IMenuRepository extends JpaRepository<Menu, Long> {
}
