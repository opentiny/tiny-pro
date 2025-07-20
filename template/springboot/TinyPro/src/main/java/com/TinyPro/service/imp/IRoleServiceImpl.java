package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.mappers.RoleMapper;
import com.TinyPro.service.IMenuService;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IRoleService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IRoleServiceImpl extends ServiceImpl<RoleMapper,Role>implements IRoleService {
    @Autowired
    private RoleMapper roleMapper;
    @Autowired
    private IPermissionService permissionService;
    @Autowired
    private IMenuService menuService;

    @Override
    public ResponseEntity<String> createRole(CreateRoleDto createRoleDto, boolean b) {
        return null;
    }

    @Override
    public ResponseEntity<List<Role>> findAllDetail(Integer page, Integer limit, String name) {
        return null;
    }

    @Override
    public void updateRole(UpdateRoleDto updateRoleDto) {
        QueryWrapper<Permission> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("id",updateRoleDto.getPermissionIds());
        List<Permission> permissionList = permissionService.list(queryWrapper);
        QueryWrapper<Menu> menuQueryWrapper = new QueryWrapper<>();
        menuQueryWrapper.in("id",updateRoleDto.getMenuIds());
        List<Menu> menuList = menuService.list(menuQueryWrapper);
    }

    @Override
    public void removeUserRById(Integer id) {
        roleMapper.removeUserRById(id);
    }
}
