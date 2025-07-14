package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Lang;
import com.TinyPro.mappers.LangMapper;
import com.TinyPro.service.ILangService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class ILangSerivceImp extends ServiceImpl<LangMapper,Lang> implements ILangService {

}
