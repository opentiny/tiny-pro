package com.TinyPro.service;

import com.TinyPro.entity.po.Menu;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface IMenuService extends IService<Menu> {
    List<Integer> getMenuAllId();
}
