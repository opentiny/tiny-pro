package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreatePermissionDto;
import com.TinyPro.entity.dto.UpdatePermissionDto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.vo.PermissionVo;
import com.TinyPro.service.IPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permission")
public class PermissionController {
    @Autowired
    private IPermissionService iPermissionService;

    @PostMapping()
    @Reject()
    @PermissionAnnotation("permission::add")
    public ResponseEntity<PermissionVo> create(@RequestBody CreatePermissionDto createPermissionDto) {
        boolean b = false;
        return iPermissionService.create(createPermissionDto, b);
    }

    @PatchMapping()
    @Reject
    @PermissionAnnotation("permission::update")
    public ResponseEntity<PermissionVo> updatePermission(@RequestBody UpdatePermissionDto updatePermissionDto) {
        return iPermissionService.updatePermission(updatePermissionDto);
    }

    @GetMapping
    @PermissionAnnotation("permission::get")
    public ResponseEntity<?> findPermissions(
            @RequestParam(required = false) Integer page,
            @RequestParam (required = false)Integer limit,
            @RequestParam(required = false) String name) {
        if (page == null && limit == null){
            List<Permission> permissionList= iPermissionService.findAllPermission();
            return ResponseEntity.ok(permissionList);
        }
        return iPermissionService.findPermissions(page, limit, name);
    }

    @DeleteMapping("/{id}")
    @Reject
    @PermissionAnnotation("permission::remove")
    public ResponseEntity<CreatePermissionDto> del(@PathVariable Integer id) {
        return iPermissionService.delPermission(id);
    }
}
