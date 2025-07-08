package com.TinyPro.service.imp;


import com.TinyPro.entity.po.Permission;
import com.TinyPro.mappers.PermissionMapper;
import com.TinyPro.service.PermissionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper,Permission>implements PermissionService {
    @Autowired
    private PermissionMapper permissionMapper;

    @Override
    public void create(Permission permission) {
        int insert = permissionMapper.insert(permission);
    }
}
