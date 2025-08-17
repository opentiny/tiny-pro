package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.vo.RolePMVo;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.service.IRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/role")
public class RoleController {
    @Autowired
    private IRoleService roleService;

    @Reject()
    @PermissionAnnotation("role::add")
    @PostMapping()
    public ResponseEntity<Role> create(@RequestBody CreateRoleDto createRoleDto) {
        return this.roleService.createRole(createRoleDto, false);
    }

    /**
     * 获取所有的角色信息
     *
     * @return
     */
    @PermissionAnnotation("role::query")
    @GetMapping()
    public ResponseEntity<List<RoleSimpleVo>> getAllRole() {
        return roleService.findAllRole();
    }

    @PermissionAnnotation("role::query")
    @GetMapping("/detail")
    public ResponseEntity<RolePMVo> getAllRoleDetail(
            @RequestParam(value = "page", defaultValue = "1", required = false) Integer page,
            @RequestParam(value = "limit", defaultValue = "10", required = false) Integer limit,
            @RequestParam(value = "name", required = false) String name
    ) {
        return this.roleService.findAllDetail(page, limit, name);
    }

    /**
     * 获取所有的角色信息
     *
     * @return
     */
    @PermissionAnnotation("role::update")
    @PatchMapping()
    @Reject()
    public ResponseEntity<Role> updateRole(@RequestBody UpdateRoleDto updateRoleDto) {
       return this.roleService.updateRole(updateRoleDto);

    }

    /**
     * 更具id删除角色
     *
     * @param id
     * @return
     */
    @PermissionAnnotation("role::remove")
    @DeleteMapping("/{id}")
    @Reject()
    public ResponseEntity<List<Map<String, String>>> deleteRole(@PathVariable Integer id) {
        return roleService.removeUserRById(id);
    }

    @GetMapping("/info/{id}")
    public ResponseEntity<Role> getRoleInfo(@PathVariable Integer id) {
        return roleService.findOne(id);
    }
}
