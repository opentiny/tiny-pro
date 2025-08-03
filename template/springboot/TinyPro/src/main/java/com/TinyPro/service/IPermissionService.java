package com.TinyPro.service;

import com.TinyPro.entity.dto.CreatePermissionDto;
import com.TinyPro.entity.dto.UpdatePermissionDto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.vo.PermissionVo;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IPermissionService  {
    ResponseEntity<PermissionVo> create(CreatePermissionDto createPermissionDto, boolean b);

    ResponseEntity<PermissionVo> updatePermission(UpdatePermissionDto updatePermissionDto);

    ResponseEntity<PageWrapper<PermissionVo>> findPermissions(Integer page, Integer limit, String name);

    ResponseEntity<CreatePermissionDto> delPermission(Integer id);
}
