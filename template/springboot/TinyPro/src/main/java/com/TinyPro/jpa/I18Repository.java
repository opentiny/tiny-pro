package com.TinyPro.jpa;

import com.TinyPro.entity.flat.I18Flat;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.vo.I18Vo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface I18Repository extends JpaRepository<I18, Long>,
        JpaSpecificationExecutor<I18> {
    Optional<I18> findByKeyAndLang_Id(String key, Long langId);
    List<I18> findByLang_Id(Long langId);
    // 使用投影，SQL 只查需要的列，不会把 Lang.i18n 带出来
    Page<I18> findAll(Specification<I18> spec, Pageable pageable);
    // 1. 返回单个
    @Query("""
        select new com.TinyPro.entity.vo.I18Vo(
            i.id,
            i.key,
            i.content,
            new com.TinyPro.entity.vo.LangVo(l.id, l.name)
        )
        from I18 i
        join i.lang l
        where i.id = :id
    """)
    Optional<I18Vo> findI18VoById(@Param("id") Long id);

    void deleteByLangId(Integer id);
}