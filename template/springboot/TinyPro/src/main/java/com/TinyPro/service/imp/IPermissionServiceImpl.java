package com.TinyPro.service.imp;


import com.TinyPro.entity.dto.CreatePermissionDto;
import com.TinyPro.entity.dto.UpdatePermissionDto;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.vo.PermissionVo;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.mappers.PermissionMapper;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.jpa.IPermissionRepository;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IPermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements IPermissionService {
    @Autowired
    private IPermissionRepository iPermissionRepository;


    @Override
    public ResponseEntity<PermissionVo> create(CreatePermissionDto createPermissionDto, boolean isInit) {
        PermissionVo result = new PermissionVo();
        String name = createPermissionDto.getName();
        String desc = createPermissionDto.getDesc();

        Optional<Permission> existingPermission = iPermissionRepository.findByName(name);

        // 情况1：初始化模式且权限已存在
        if (isInit && existingPermission.isPresent()) {
            BeanUtils.copyProperties(existingPermission.get(), result);
            return ResponseEntity.ok(result);
        }

        // 情况2：非初始化模式且权限已存在
        if (existingPermission.isPresent() && !isInit) {
            throw new BusinessException("exception.permission.exists");
        }

        // 情况3：创建新权限
        Permission newPermission = new Permission();
        newPermission.setName(name);
        newPermission.setDesc(desc);
        Permission save = iPermissionRepository.save(newPermission);
        BeanUtils.copyProperties(save, result);
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<PermissionVo> updatePermission(UpdatePermissionDto updatePermissionDto) {
        PermissionVo result = new PermissionVo();
        Integer id = updatePermissionDto.getId();
        String name = updatePermissionDto.getName();
        String desc = updatePermissionDto.getDesc();

        Permission permission = iPermissionRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new BusinessException("exception.permission.notExists"));

        permission.setName(name);
        permission.setDesc(desc);
        Permission save = iPermissionRepository.save(permission);
        BeanUtils.copyProperties(save, result);
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<PermissionVo>> findPermissions(Integer page, Integer limit, String name) {
        // 处理分页参数
        boolean unlimited = limit == null || limit <= 0;
        Pageable pageable = unlimited ?
                Pageable.unpaged() :
                PageRequest.of(page == null || page <= 0 ? 0 : page - 1, limit);

        // 执行查询
        Page<Permission> permissionPage;
        if (name != null && !name.trim().isEmpty()) {
            permissionPage = iPermissionRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
        } else {
            permissionPage = iPermissionRepository.findAll(pageable);
        }

        // 转换为VO
        return ResponseEntity.ok(permissionPage.getContent()
                .stream()
                .map(permission -> {
                    PermissionVo vo = new PermissionVo();
                    vo.setId(permission.getId());
                    vo.setName(permission.getName());
                    vo.setDesc(permission.getDesc());
                    return vo;
                })
                .collect(Collectors.toList()));
    }

    @Override
    public ResponseEntity<CreatePermissionDto> delPermission(Integer id) {
        CreatePermissionDto result = new CreatePermissionDto();
        Permission permission = iPermissionRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new BusinessException("Permission not found with id: " + id));

        iPermissionRepository.delete(permission);
        BeanUtils.copyProperties(permission,result);
        return ResponseEntity.ok(result);
    }

}
