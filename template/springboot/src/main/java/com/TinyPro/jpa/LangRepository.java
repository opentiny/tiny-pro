package com.TinyPro.jpa;

import com.TinyPro.entity.po.Lang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LangRepository extends JpaRepository<Lang, Long> {
    Optional<Lang> findByName(String name);
    Optional<Lang> findFirstByNameOrderByIdAsc(String name);

    @Query("""
            select distinct l
            from Lang l
            left join fetch l.i18ns
            """)
    List<Lang> findAllWithI18ns();

    @Query("""
            select distinct l
            from Lang l
            left join fetch l.i18ns
            where l.name = :name
            """)
    Optional<Lang> findByNameWithI18ns(@Param("name") String name);
}
