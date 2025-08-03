package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateLangDto;
import com.TinyPro.entity.po.Lang;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.http.ResponseEntity;

import java.util.List;


public interface ILangService  {

    ResponseEntity<Lang> create(CreateLangDto createLangDto);

    ResponseEntity<List<Lang>> findAll();

    ResponseEntity<Lang> update(Integer id, CreateLangDto createLangDto);

    ResponseEntity<Lang> remove(Integer id);
}
