package com.TinyPro.service.jpa;

import com.TinyPro.entity.po.Lang;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LangRepository extends JpaRepository<Lang, Long> {
}