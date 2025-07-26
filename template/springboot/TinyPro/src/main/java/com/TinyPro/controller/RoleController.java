package com.TinyPro.controller;

import com.TinyPro.annotation.Permission;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.service.IRoleService;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role")
public class RoleController {
    @Autowired
    private IRoleService roleService;

    @Reject()
    @Permission("role::add")
    @PostMapping()
    public ResponseEntity<Role> create(@RequestBody CreateRoleDto createRoleDto) {
        return this.roleService.createRole(createRoleDto,false);
    }

    /**
     * 获取所有的角色信息
     * @return
     */
    @Permission("role::query")
    @GetMapping()
   public ResponseEntity<List<RoleSimpleVo>> getAllRole() {
        return roleService.findAllRole();
    }

    @Permission("role::query")
    @GetMapping("/detail")
    public ResponseEntity<List<MenuTreeVo>> getAllRoleDetail(
            @RequestParam(value = "page", defaultValue = "1",required = false)Integer page,
            @RequestParam(value = "limit", defaultValue = "10", required = false) Integer limit,
            @RequestParam(value = "name",required = false) String name
    ) {
        return this.roleService.findAllDetail(page, limit, name);
    }

    /**
     * 获取所有的角色信息
     * @return
     */
    @Permission("role::update")
    @PatchMapping()
    @Reject
    public ResponseEntity<String> updateRole(@RequestBody UpdateRoleDto updateRoleDto) {
        this.roleService.updateRole(updateRoleDto);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    /**
     * 更具id删除角色
     * @param id
     * @return
     */
    @Permission("role::remove")
    @DeleteMapping("/{id}")
    @Reject
    public ResponseEntity<String> deleteRole(@PathVariable Integer id) {
        roleService.removeUserRById(id);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    @GetMapping("/info/{id}")
    public ResponseEntity<Role> getRoleInfo(@PathVariable Integer id) {
        return new ResponseEntity<>(roleService.getById(id), HttpStatus.OK);
    }
}
