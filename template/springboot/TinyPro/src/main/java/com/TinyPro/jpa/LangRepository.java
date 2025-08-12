package com.TinyPro.jpa;

import com.TinyPro.entity.po.Lang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LangRepository extends JpaRepository<Lang, Long> {
    Optional<Lang> findByName(String name);
}