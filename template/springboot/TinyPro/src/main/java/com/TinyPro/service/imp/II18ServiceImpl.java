package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.flat.I18Flat;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.vo.I18Vo;
import com.TinyPro.entity.vo.LangVo;
import com.TinyPro.exception.BusinessException;

import com.TinyPro.service.II18Service;
import com.TinyPro.jpa.I18Repository;
import com.TinyPro.jpa.LangRepository;
import com.alibaba.fastjson.JSON;

import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class II18ServiceImpl implements II18Service {
    @Autowired
    private LangRepository langRepository;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private I18Repository i18Repository;

    @Override
    public ResponseEntity<String> create(CreateI18Dto createI18Dto) {
        Lang lang = langRepository.getById(Long.valueOf(createI18Dto.getLang()));
        if (lang == null) {
            throw new BusinessException("exception.lang.notExists", HttpStatus.NOT_FOUND, null);
        }
        // 2. 校验 key + lang 是否已存在
        if (i18Repository.findByKeyAndLang_Id(createI18Dto.getKey(), Long.valueOf(lang.getId())).isPresent()) {
            throw new BusinessException("exception.i18.exists", HttpStatus.BAD_REQUEST, null);
        }
        I18 i18 = new I18();
        i18.setLang(lang);
        i18.setKey(createI18Dto.getKey());
        i18.setContent(createI18Dto.getContent());
        I18 save = i18Repository.save(i18);
        //TODO 这个地方的返回值进行转变成字符串
        return new ResponseEntity<>(JSON.toJSONString(save), HttpStatus.OK);
    }

    @Override
    public Map<String, Map<String, String>> getFormat(String lang, HttpServletRequest request) {
        if (StringUtils.isEmpty(lang)) {
            lang = request.getHeader("x-lang");
        }
        Map<String, Map<String, String>> result = new HashMap<>();
        Lang langData = langRepository.findByName(lang).orElse(null);
        if (langData == null) {
            throw new BusinessException("exception.lang.notExists", HttpStatus.NOT_FOUND, null);
        }
        List<I18> i18List = i18Repository.findByLang_Id(Long.valueOf(langData.getId()));
        Map<String, String> i18map = new HashMap<>();
        i18List.forEach(item -> {
            i18map.put(item.getKey(), item.getContent());
        });
        result.put(lang, i18map);
        return result;
    }

    @Override
    public ResponseEntity<PageWrapper<I18Vo>> findAll(Integer page,
                                                      Integer limit,
                                                      Boolean allBool,
                                                      List<String> lang,
                                                      String key,
                                                      String content) {

        // 1. 构造分页/不分页
        Pageable pageable;
        if (Boolean.FALSE.equals(allBool)) {
            pageable = Pageable.unpaged();
        } else if (page != null && limit != null && page > 0 && limit > 0) {
            pageable = PageRequest.of(page - 1, limit);
        } else {
            pageable = PageRequest.of(0, 10);
        }

        // 2. 动态条件（复用原来的 Specification）
        Specification<I18> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (lang != null && !lang.isEmpty()) {
                predicates.add(root.get("lang").get("name").in(lang)); // 按 lang.name 过滤
            }
            if (StringUtils.hasText(content)) {
                predicates.add(cb.like(root.get("content"), "%" + content + "%"));
            }
            if (StringUtils.hasText(key)) {
                predicates.add(cb.like(root.get("key"), "%" + key + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 3. 查询并返回 D
        Page<I18Flat> flatPage = i18Repository.findAllDto(spec, pageable);
        List<I18Vo> dtoList = flatPage.getContent()
                .stream()
                .map(f -> new I18Vo(
                        f.getId(),
                        f.getKey(),
                        f.getContent(),
                        new LangVo(f.getLangId(), f.getLangName())
                ))
                .toList();
        Page<I18Vo> result = new PageImpl<>(dtoList, flatPage.getPageable(), flatPage.getTotalElements());
        return ResponseEntity.ok(PageWrapper.of(result));
    }

    @Override
    public ResponseEntity<I18> updateByi18nId(Long id, UpdateI18Dto dto) {
        I18 i18 = i18Repository.getById(id);
        i18.setKey(dto.getKey());
        i18.setContent(dto.getContent());
        Lang lang = langRepository.getById(Long.valueOf(dto.getLang()));
        if (lang == null) {
            throw new BusinessException("exception.auth.passwordOrEmailError", HttpStatus.NOT_FOUND, null);
        }
        i18.setLang(lang);
        I18 newi18 = i18Repository.save(i18);
        //TODO 需要仔细看看
        return new ResponseEntity<>(newi18, HttpStatus.OK);
    }

    @Override
    public I18Vo getI18ById(Integer id) {
        I18Vo i18 = i18Repository.findI18VoById(Long.valueOf(id)).get();
        if (i18 == null) {
            throw new BusinessException("exception.i18.notExists", HttpStatus.NOT_FOUND ,null);
        }
        return i18;
    }

    @Override
    public I18 removei18ById(Integer id) {
        I18 result = i18Repository.findById(Long.valueOf(id))
                .orElseThrow(() -> new BusinessException("I18 not found with id: " + id));
        i18Repository.deleteById(Long.valueOf(id));
        return result;
    }
}
