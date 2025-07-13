package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.po.I18;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface II18Service extends IService<I18> {

    ResponseEntity<String> create(CreateI18Dto createI18Dto);

    Map<String, Map<String, String>> getFormat(String lang);

    ResponseEntity<IPage<I18>> findAll(Integer page, Integer limit, Boolean allBool, List<Integer> lang, String key, String content);

    ResponseEntity<String> updateByi18nId(java.lang.Long id, @Valid UpdateI18Dto dto);
}
