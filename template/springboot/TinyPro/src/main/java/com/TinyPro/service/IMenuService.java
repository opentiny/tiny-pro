package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateMenuDto;
import com.TinyPro.entity.dto.UpdateMenuDto;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.vo.MenuVo;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IMenuService extends IService<Menu> {
    List<Integer> getMenuAllId();

    ResponseEntity<List<MenuVo>>  getMenubyEmail(String email);

    ResponseEntity<List<MenuVo>> findAllMenu();

    ResponseEntity<Menu> createMenu(CreateMenuDto createMenuDto, boolean b);

    ResponseEntity<Boolean> updateMenu(UpdateMenuDto updateMenuDto);

    ResponseEntity<Menu> deleteMenu(Integer id, Integer parentId);
}
