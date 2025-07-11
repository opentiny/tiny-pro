package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Lang;
import com.TinyPro.mappers.LangMapper;
import com.TinyPro.service.LangService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LangSerivceImp extends ServiceImpl<LangMapper, Lang> implements LangService {
    @Autowired
    private LangMapper langMapper;
//    @Override
//    public Integer saveLang(Lang lang) {
////        return langMapper.saveLang(lang);
//    }
}
