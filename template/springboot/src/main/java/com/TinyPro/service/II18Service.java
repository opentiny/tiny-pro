package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.vo.I18Vo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface II18Service {

    ResponseEntity<String>  create(CreateI18Dto createI18Dto);

    Map<String, Map<String, String>> getFormat(String lang, HttpServletRequest request);

    ResponseEntity<PageWrapper<I18Vo>> findAll(Integer page, Integer limit, Boolean allBool, Integer lang, String key, String content);

    ResponseEntity<I18Vo> updateByi18nId(java.lang.Long id, @Valid UpdateI18Dto dto);

    I18Vo getI18ById(Integer id);

    I18 removei18ById(Integer id);

    ResponseEntity<List<I18>> batchDeleteUser(List<Long> ids);
}
