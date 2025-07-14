package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.po.Role;
import com.TinyPro.mappers.RoleMapper;
import com.TinyPro.service.IRoleService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IRoleServiceImpl extends ServiceImpl<RoleMapper,Role>implements IRoleService {
    @Autowired
    private RoleMapper roleMapper;

    @Override
    public ResponseEntity<String> createRole(CreateRoleDto createRoleDto, boolean b) {
        return null;
    }

    @Override
    public ResponseEntity<List<Role>> findAllDetail(Integer page, Integer limit, String name) {
        return null;
    }
}
