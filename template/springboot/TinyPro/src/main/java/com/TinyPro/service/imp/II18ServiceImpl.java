package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.mappers.I18Mapper;
import com.TinyPro.service.II18Service;
import com.TinyPro.utils.LocaleUntil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mysql.cj.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class II18ServiceImpl extends ServiceImpl<I18Mapper,I18> implements II18Service {
    @Autowired
    private I18Mapper i18Mapper;
    @Autowired
    private ILangSerivceImp langSerivceImp;
    @Autowired
    private MessageSource messageSource;

    @Override
    public ResponseEntity<String> create(CreateI18Dto createI18Dto) {
        I18 newi18 = new I18();
        Lang lang = langSerivceImp.getById(createI18Dto.getLang());
        if (lang==null){
            String message = messageSource.getMessage("exception.lang.notExists", null, LocaleUntil.getLocale());
            return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
        }
        QueryWrapper<I18> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("key",createI18Dto.getKey()).eq("lang_id",lang.getId());
        I18 i18 = i18Mapper.selectOne(queryWrapper);
        if (i18!=null){
            String message = messageSource.getMessage("exception.i18.exists", null, LocaleUntil.getLocale());
            return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
        }
        newi18.setKey(createI18Dto.getKey());
        newi18.setContent(createI18Dto.getContent());
        newi18.setLang(lang);
        i18Mapper.insert(newi18);
        //TODO 这个地方的返回值进行转变成字符串
        return new ResponseEntity<>(newi18.toString(),HttpStatus.OK);
    }

    @Override
    public Map<String, Map<String, String>> getFormat(String lang) {
        if (StringUtils.isNullOrEmpty(lang)){
            lang="";
        }
        Map<String,Map<String,String>> result=new HashMap<>();
        QueryWrapper<Lang> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name",lang);
        Lang langData = langSerivceImp.getOne(queryWrapper);
        QueryWrapper<I18> i18QueryWrapper = new QueryWrapper<I18>().eq("lang_id", langData.getId());
        List<I18> i18List = i18Mapper.selectList(i18QueryWrapper);
        Map<String, String> i18map = new HashMap<>();
        i18List.forEach(item->{
            i18map.put(item.getKey(),item.getContent());
        });
        result.put(lang,i18map);
        return result;
    }

    @Override
    public ResponseEntity<IPage<I18>> findAll(Integer page, Integer limit, Boolean allBool, List<Integer> lang, String key, String content) {
        // 1. 先算总条数（all=true 时需要）
        long total = allBool != null && allBool ? i18Mapper.selectCount(null) : 0L;

        // 2. 构造分页对象
        Page<I18> mpPage;
        if (Boolean.TRUE.equals(allBool)) {
            // 一次性返回全部
            mpPage = Page.of(1, (int) Math.min(total, 10_000), false); // 不查 count
        } else if (page != null && limit != null && page > 0 && limit > 0) {
            // 正常分页
            mpPage = Page.of(page, limit);
        } else {
            // 兜底：默认第一页 10 条
            mpPage = Page.of(1, 10);
        }

        // 3. 构造查询条件
        LambdaQueryWrapper<I18> qw = Wrappers.lambdaQuery();
        if (lang != null && !lang.isEmpty()) {
            qw.in(I18::getLang, lang);
        }
        if (StringUtils.isNullOrEmpty(content)) {
            qw.like(I18::getContent, content);
        }
        if (StringUtils.isNullOrEmpty(key)) {
            qw.like(I18::getKey, key);
        }

        // 4. 查询并返回
        return new ResponseEntity<IPage<I18>>(i18Mapper.selectPage(mpPage, qw),HttpStatus.OK);
    }

    @Override
    public ResponseEntity<String> updateByi18nId(Long id, UpdateI18Dto dto) {
        I18 i18 = this.getById(id);
        i18.setKey(dto.getKey());
        i18.setContent(dto.getContent());
        Lang lang = langSerivceImp.getById(dto.getLang());
        if (lang==null){
            String message = messageSource.getMessage("exception.lang.notExists", null, LocaleUntil.getLocale());
            return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
        }
        i18.setLang(lang);
        this.updateById(i18);
        //TODO 需要仔细看看
        return new ResponseEntity<>("success",HttpStatus.OK);
    }
}
