package com.TinyPro.service;

import com.TinyPro.entity.po.Role;
import com.baomidou.mybatisplus.extension.service.IService;

public interface RoleService extends IService<Role> {
    Role create(Role role);
}
