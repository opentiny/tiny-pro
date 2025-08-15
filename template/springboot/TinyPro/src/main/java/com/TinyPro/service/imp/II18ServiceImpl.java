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

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
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

        // 2. 动态条件（改进后的 Specification）
        Specification<I18> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 按 lang.name 过滤
            if (lang != null && !lang.isEmpty()) {
                // 假设 lang 是 List<String>
                predicates.add(root.get("lang").get("name").in(lang));
            }
            // 按 content 过滤，支持不同的匹配模式
            if (StringUtils.isNoneBlank(content)) {
                Predicate contentPredicate = buildLikePredicate(root, cb, "content", content);
                predicates.add(contentPredicate);
            }

            // 按 key 过滤，支持不同的匹配模式
            if (StringUtils.isNoneBlank(key)) {
                Predicate keyPredicate = buildLikePredicate(root, cb, "key", key);
                predicates.add(keyPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 3. 查询并返回 D
        Page<I18> flatPage = i18Repository.findAll(spec, pageable);
        List<I18Vo> dtoList = flatPage.getContent()
                .stream()
                .map(f -> new I18Vo(
                        f.getId(),
                        f.getKey(),
                        f.getContent(),
                        new LangVo(f.getLang().getId(), f.getLang().getName())
                ))
                .toList();
        Page<I18Vo> result = new PageImpl<>(dtoList, flatPage.getPageable(), flatPage.getTotalElements());
        return ResponseEntity.ok(PageWrapper.of(result));
    }

    @Override
    public ResponseEntity<I18Vo> updateByi18nId(Long id, UpdateI18Dto dto) {
        I18 i18 = i18Repository.getById(id);
        if (StringUtils.isNotEmpty(dto.getKey())) {
            i18.setKey(dto.getKey());
        }
        if (StringUtils.isNotEmpty(dto.getContent())) {
            i18.setContent(dto.getContent());
        }
        if (dto.getLang() != null) {
          try{
            Lang lang = langRepository.getById(Long.valueOf(dto.getLang()));
            if (lang == null) {
                throw new BusinessException("exception.auth.passwordOrEmailError", HttpStatus.NOT_FOUND, null);
            }
            i18Repository.save(i18);
            I18Vo result = new I18Vo(i18.getId(), i18.getKey(), i18.getContent(), new LangVo(lang.getId(), lang.getName()));
            return new ResponseEntity<>(result, HttpStatus.OK);
            } catch (Throwable e){
            throw new
BusinessException("exception.auth.passwordOrEmailError", HttpStatus.NOT_FOUND, null);
             }
        } else {
            i18Repository.save(i18);
            return ResponseEntity.ok(new I18Vo(i18.getId(), i18.getKey(), i18.getContent(), new LangVo(i18.getLang().getId(), i18.getLang().getName())));
        }
        //TODO 需要仔细看看
    }

    @Override
    public I18Vo getI18ById(Integer id) {
        I18Vo i18 = i18Repository.findI18VoById(Long.valueOf(id)).get();
        if (i18 == null) {
            throw new BusinessException("exception.i18.notExists", HttpStatus.NOT_FOUND, null);
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

    @Override
    public ResponseEntity<List<I18>> batchDeleteUser(List<Long> ids) {
        try {
            List<I18> result = i18Repository.findAllById(ids);
            i18Repository.deleteAllByIdInBatch(ids);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new BusinessException("删除id失败", HttpStatus.NOT_FOUND, null);
        }
    }

    private Predicate buildLikePredicate(Root<I18> root, CriteriaBuilder cb, String field, String input) {
        if (input.contains("%")) {
            if (input.startsWith("%") && input.endsWith("%")) {
                // 包含匹配 LIKE '%value%'
                String value = input.substring(1, input.length() - 1);
                return cb.like(root.get(field), "%" + value + "%");
            } else if (input.startsWith("%")) {
                // 后缀匹配 LIKE '%value'
                String value = input.substring(1);
                return cb.like(root.get(field), "%" + value);
            } else if (input.endsWith("%")) {
                // 前缀匹配 LIKE 'value%'
                String value = input.substring(0, input.length() - 1);
                return cb.like(root.get(field), value + "%");
            } else {
                // 如果包含 % 但不以 % 开头或结尾，可以根据需求处理
                // 这里简单地将所有 % 视为通配符，您可以根据需要调整
                return cb.like(root.get(field), input);
            }
        } else {
            // 精确匹配 =
            return cb.equal(root.get(field), input);
        }
    }
}
