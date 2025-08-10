package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateLangDto;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.service.ILangService;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lang")
public class LangController {
    @Autowired
    private ILangService langService;

    @Reject()
    @PermissionAnnotation("lang::add")
    @PostMapping
    public ResponseEntity<Lang> createLang(CreateLangDto createLangDto) {
        return this.langService.create(createLangDto);
    }

    @PermissionAnnotation("lang::query")
    @GetMapping
    public ResponseEntity<List<Lang>> findAllLang() {
        return this.langService.findAll();
    }

    @Reject()
    @PermissionAnnotation("lang::update")
    @PatchMapping("/{id}")
   public ResponseEntity<Lang> updateLang(
            @Param("id")Integer id,
            @RequestBody(required = false) CreateLangDto createLangDto
    ) {
        return this.langService.update(id, createLangDto);
    }

    @Reject()
    @PermissionAnnotation("lang::remove")
    @DeleteMapping("/{id}")
     public ResponseEntity<Lang> removeLang(@PathVariable Integer id) {
        return this.langService.remove(id);
    }
}
