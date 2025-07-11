package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Menu;
import com.TinyPro.mappers.MenuMapper;
import com.TinyPro.service.MenuService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuServiceImpl extends ServiceImpl<MenuMapper, Menu> implements MenuService{
    @Autowired
    private MenuMapper menuMapper;

    @Override
    public List<Integer> getMenuAllId() {
        return menuMapper.selectList(null).stream()
                .map(Menu::getId)
                .collect(Collectors.toList());
    }
}
