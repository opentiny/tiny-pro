package com.TinyPro.service;

import com.TinyPro.entity.po.Permission;
import com.baomidou.mybatisplus.extension.service.IService;

public interface PermissionService extends IService<Permission> {
    void create(Permission permissionAnnotation);
}
