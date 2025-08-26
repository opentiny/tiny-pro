package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateLangDto;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.service.ILangService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
    public ResponseEntity<Lang> createLang(@RequestBody @Valid CreateLangDto createLangDto) {
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
            @Param("id") @NotNull(message = "{NOT_EMPTY}") Integer id,
            @RequestBody(required = false)@Valid CreateLangDto createLangDto
    ) {
        return this.langService.update(id, createLangDto);
    }

    @Reject()
    @PermissionAnnotation("lang::remove")
    @DeleteMapping("/{id}")
     public ResponseEntity<Lang> removeLang(@PathVariable @NotNull(message = "{NOT_EMPTY}") Integer id) {
        return this.langService.remove(id);
    }
}
