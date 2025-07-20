package com.TinyPro.controller;

import com.TinyPro.annotation.Permission;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.po.I18;
import com.TinyPro.service.II18Service;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("i18")
public class I18Controller {
 @Autowired
 private II18Service i18Service;
 @Reject
 @Permission("i18n::add")
 @PostMapping
 public ResponseEntity<String> createI18Dto(@Valid CreateI18Dto createI18Dto){
      return i18Service.create(createI18Dto);
 }
 @GetMapping("format")
 public ResponseEntity<Map<String,Map<String,String>>> getFormat(@PathVariable(name = "lang") String lang){
     Map<String,Map<String,String>>result= i18Service.getFormat(lang);
     return new ResponseEntity<>(result, HttpStatus.OK);
 }
    @GetMapping
    @Permission("i18n::query")
    public ResponseEntity<IPage<I18>> findAll(@RequestParam(defaultValue = "1") Integer page,
                                              @RequestParam(defaultValue = "0") Integer limit,
                                              @RequestParam(required = false) Integer all,
                                              @RequestParam(defaultValue = "") List<Integer> lang, // 或 List<Integer>
                                              @RequestParam(required = false) String key,
                                              @RequestParam(required = false) String content){
        boolean allBool = all != null && all != 0;
     return i18Service.findAll(page,limit,allBool,lang,key,content);
    }
    @Permission("i18n::query")
    @GetMapping("{id}")
    public ResponseEntity<I18> findOne(@PathVariable Integer id) {
        return new ResponseEntity<I18>(i18Service.getById(id),HttpStatus.OK);
    }
    @PatchMapping("/{id}")
    @Permission("i18n::update")
    public ResponseEntity<String> update(
            @PathVariable Long id,
            @RequestBody @Valid UpdateI18Dto dto) {
        return i18Service.updateByi18nId(id, dto);
    }
    @Reject()
    @Permission("i18n::remove")
    @DeleteMapping("{id}")
   public ResponseEntity<String> remove(@PathVariable Integer id) {
         this.i18Service.removeById(id);
         return new ResponseEntity<>("success",HttpStatus.OK);
    }
}
