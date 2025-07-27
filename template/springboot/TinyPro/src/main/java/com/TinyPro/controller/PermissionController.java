package com.TinyPro.controller;

import com.TinyPro.annotation.Permission;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreatePermissionDto;
import com.TinyPro.entity.dto.UpdatePermissionDto;
import com.TinyPro.entity.vo.PermissionVo;
import com.TinyPro.service.IPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
    @Permission("permission::add")
    public ResponseEntity<PermissionVo> create(@RequestBody CreatePermissionDto createPermissionDto) {
        boolean b = false;
        return iPermissionService.create(createPermissionDto, b);
    }

    @PatchMapping()
    @Reject
    @Permission("permission::update")
    public ResponseEntity<PermissionVo> updatePermission(@RequestBody UpdatePermissionDto updatePermissionDto) {
        return iPermissionService.updatePermission(updatePermissionDto);
    }

    @GetMapping
    @Permission("permission::get")
    public ResponseEntity<List<PermissionVo>> findPermissions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "0") int limit,
            @RequestParam(required = false) String name) {

        return iPermissionService.findPermissions(page, limit, name);
    }

    @DeleteMapping("/{id}")
    @Reject
    @Permission("permission::remove")
    public ResponseEntity<CreatePermissionDto> del(@PathVariable Integer id) {
        return iPermissionService.delPermission(id);
    }
}
