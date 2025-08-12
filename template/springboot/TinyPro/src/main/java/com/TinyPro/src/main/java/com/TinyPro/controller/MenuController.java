package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateMenuDto;
import com.TinyPro.entity.dto.UpdateMenuDto;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.vo.MenuVo;
import com.TinyPro.service.IMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuController {
    @Autowired
    private IMenuService iMenuService;

    @GetMapping("/role/{email}")
    public ResponseEntity<List<MenuVo>> getMenus(@PathVariable String email) {
        return iMenuService.getMenubyEmail(email);
    }

    @GetMapping
    @PermissionAnnotation("menu::query")
    public ResponseEntity<List<MenuVo>> getAllMenus() {
        return iMenuService.findAllMenu();
    }

    @Reject
    @PermissionAnnotation("menu::add")
    @PostMapping
    public ResponseEntity<Menu> createMenu(@RequestBody CreateMenuDto createMenuDto) {
        boolean b = false;
        return iMenuService.createMenu(createMenuDto, b);
    }

    @PatchMapping
    @Reject
    @PermissionAnnotation("menu::update")
    public ResponseEntity<Boolean> updateMenu(@RequestBody UpdateMenuDto updateMenuDto) {
        return iMenuService.updateMenu(updateMenuDto);
    }

    @DeleteMapping
    @Reject
    @PermissionAnnotation("menu::remove")
    public ResponseEntity<Menu> deleteMenu(@Param("id") Integer id, @Param("parentId") Integer parentId) {
        return iMenuService.deleteMenu(id, parentId);
    }
}
