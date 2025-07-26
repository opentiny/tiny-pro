package com.TinyPro.controller;

import com.TinyPro.annotation.Permission;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateI18Dto;
import com.TinyPro.entity.dto.UpdateI18Dto;
import com.TinyPro.entity.page.Meta;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.vo.I18Vo;
import com.TinyPro.entity.vo.LangVo;
import com.TinyPro.service.II18Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/i18")
public class I18Controller {
 @Autowired
 private II18Service i18Service;
// @Reject
 @Permission("i18n::add")
 @PostMapping("")
 public ResponseEntity<String> createI18Dto(@Valid @RequestBody CreateI18Dto createI18Dto){
      return i18Service.create(createI18Dto);
 }
 @GetMapping("/format")
 public ResponseEntity<Map<String,Map<String,String>>> getFormat(@Param("lang")  String lang){
     Map<String,Map<String,String>>result= i18Service.getFormat(lang);
     return new ResponseEntity<>(result, HttpStatus.OK);
 }
    @GetMapping("/test")
    public String test() {
       return "{\"status\":\"ok\"}";
    }
    @GetMapping
    @Permission("i18n::query")
    public ResponseEntity<PageWrapper<I18Vo>>findAll(@RequestParam(defaultValue = "1") Integer page,
                                                     @RequestParam(defaultValue = "0") Integer limit,
                                                     @RequestParam(required = false) Integer all,
                                                     @RequestParam(defaultValue = "") List<String> lang, // 或 List<Integer>
                                                     @RequestParam(required = false) String key,
                                                     @RequestParam(required = false) String content){
        boolean allBool = !(all != null && all != 0);
     return i18Service.findAll(page,limit,allBool,lang,key,content);
    }
    @Permission("i18n::query")
    @GetMapping("{id}")
    public ResponseEntity<I18Vo> findOne(@PathVariable Integer id) {
        return new ResponseEntity<I18Vo>(i18Service.getI18ById(id),HttpStatus.OK);
    }
    @PatchMapping("/{id}")
    @Permission("i18n::update")
    public ResponseEntity<I18> update(
            @PathVariable Long id,
            @RequestBody @Valid UpdateI18Dto dto) {
        return i18Service.updateByi18nId(id, dto);
    }
    @Reject()
    @Permission("i18n::remove")
    @DeleteMapping("{id}")
   public ResponseEntity<I18> remove(@PathVariable Integer id) {
         I18 result=i18Service.removei18ById(id);
         return new ResponseEntity<>(result,HttpStatus.OK);
    }
}
