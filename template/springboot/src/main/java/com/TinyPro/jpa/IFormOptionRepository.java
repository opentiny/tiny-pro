package com.TinyPro.jpa;

import com.TinyPro.entity.po.FormOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IFormOptionRepository extends JpaRepository<FormOption, Long> {

    List<FormOption> findByEnabledTrueOrderByOptionTypeAscSortOrderAscIdAsc();
}
