package com.TinyPro.service.imp;


import com.TinyPro.entity.po.Permission;
import com.TinyPro.mappers.PermissionMapper;
import com.TinyPro.service.IPermissionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IPermissionServiceImpl extends ServiceImpl<PermissionMapper,Permission>implements IPermissionService {
    @Autowired
    private PermissionMapper permissionMapper;

    @Override
    public void create(Permission permission) {
        int insert = permissionMapper.insert(permission);
    }
}
