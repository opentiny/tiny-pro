package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.entity.vo.RolePMVo;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface IRoleService  {

    ResponseEntity<Role> createRole(CreateRoleDto createRoleDto, boolean b);

    ResponseEntity<RolePMVo> findAllDetail(Integer page, Integer limit, String name);

    ResponseEntity<Role> updateRole(UpdateRoleDto updateRoleDto);

    ResponseEntity<List<Map<String, String>>> removeUserRById(Integer id);

    ResponseEntity<List<RoleSimpleVo>> findAllRole();

    ResponseEntity<Role> findOne(Integer id);
}
