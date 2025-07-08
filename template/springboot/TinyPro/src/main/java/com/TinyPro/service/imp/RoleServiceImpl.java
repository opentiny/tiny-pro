package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Role;
import com.TinyPro.mappers.RoleMapper;
import com.TinyPro.service.RoleService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper,Role>implements RoleService {
    @Autowired
    private RoleMapper roleMapper;
    @Override
    public Role create(Role role) {
        roleMapper.insert(role);
        return role;
    }
}
