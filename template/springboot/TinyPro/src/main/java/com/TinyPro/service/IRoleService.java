package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.po.Role;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IRoleService extends IService<Role> {

    ResponseEntity<String> createRole(CreateRoleDto createRoleDto, boolean b);

    ResponseEntity<List<Role>> findAllDetail(Integer page, Integer limit, String name);

    void updateRole(UpdateRoleDto updateRoleDto);

    void removeUserRById(Integer id);
}
