package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.mappers.RoleMapper;
import com.TinyPro.service.IMenuService;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IRoleService;
import com.TinyPro.service.jpa.IMenuRepository;
import com.TinyPro.service.jpa.IPermissionRepository;
import com.TinyPro.service.jpa.IRoleRepository;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class IRoleServiceImpl extends ServiceImpl<RoleMapper,Role>implements IRoleService {
    @Autowired
    private IRoleRepository iRoleRepository;
    @Autowired
    private IPermissionRepository permissionService;
    @Autowired
    private IMenuRepository menuService;

    @Override
    public ResponseEntity<Role> createRole(CreateRoleDto createRoleDto, boolean isInit) {
        // 检查角色是否已存在
        Optional<Role> existingRole = iRoleRepository.findByName(createRoleDto.getName());

        if (isInit && existingRole.isPresent()) {
            return ResponseEntity.ok(existingRole.get());
        }

        if (existingRole.isPresent()) {
            throw new BusinessException("exception.role.exists");
        }

        // 获取关联实体
        List<Permission> permissions = permissionService.findAllById(
                createRoleDto.getPermissionIds() != null ? createRoleDto.getPermissionIds() : Collections.emptyList()
        );

        List<Menu> menus = menuService.findAllById(
                createRoleDto.getMenuIds() != null ? createRoleDto.getMenuIds() : Collections.emptyList()
        );

        // 创建新角色
        Role newRole = new Role();
        newRole.setName(createRoleDto.getName());
        newRole.setPermission(permissions);
        newRole.setMenus(menus);

        return ResponseEntity.ok(iRoleRepository.save(newRole));
    }

    @Override
    public ResponseEntity<List<MenuTreeVo>> findAllDetail(Integer page, Integer limit, String name) {
//        // 构建分页参数
//        Pageable pageable = PageRequest.of(
//                page == null || page <= 0 ? 0 : page - 1,
//                limit == null || limit <= 0 ? 10 : limit
//        );
//
//        // 构建查询条件
//        Specification<Role> spec = (root, query, cb) -> {
//            List<Predicate> predicates = new ArrayList<>();
//            if (StringUtils.hasText(name)) {
//                predicates.add(cb.like(root.get("name"), "%" + name + "%"));
//            }
//            return cb.and(predicates.toArray(new Predicate[0]));
//        };
//
//        // 查询角色（仅加载 menus）
//        Page<Role> rolePage = iRoleRepository.findAllWithMenus(spec, pageable);
//
//        // 手动加载 permission
//        List<Long> roleIds = rolePage.getContent().stream()
//                .map(Role::getId)
//                .collect(Collectors.toList());
//
//        Map<Long, List<Permission>> permissionsMap = permissionService.findByRoleIdIn(roleIds)
//                .stream()
//                .collect(Collectors.groupingBy(Permission::getRoleId));
//
//        rolePage.getContent().forEach(role ->
//                role.setPermission(permissionsMap.get(role.getId()))
//        );
//
//        // 构建菜单树
//        List<MenuTreeVo> menuTrees = rolePage.getContent().stream()
//                .map(role -> convertToTree(role.getMenus()))
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(menuTrees);
        return ResponseEntity.ok(new ArrayList<>());
    }

    private MenuTreeVo convertToTree(List<Menu> menus) {
        // 实现菜单列表转树形结构的逻辑
        // 示例：假设菜单有parentId字段表示层级关系
        Map<Integer, MenuTreeVo> map = new HashMap<>();
        MenuTreeVo root = null;

        // 第一遍：创建所有节点
        for (Menu menu : menus) {
            MenuTreeVo node = new MenuTreeVo(menu.getId(), menu.getName(), new ArrayList<>());
            map.put(menu.getId(), node);
            if (menu.getParentId() == null) {
                root = node;
            }
        }

        // 第二遍：构建树结构
        for (Menu menu : menus) {
            if (menu.getParentId() != null) {
                MenuTreeVo parent = map.get(menu.getParentId());
                if (parent != null) {
                    parent.getChildren().add(map.get(menu.getId()));
                }
            }
        }

        return root;
    }

    @Override
    public void updateRole(UpdateRoleDto updateRoleDto) {
     return;
    }

    @Override
    public void removeUserRById(Integer id) {
        return;
    }

    @Override
    public ResponseEntity<List<RoleSimpleVo>> findAllRole() {
        List<Role> roles = iRoleRepository.findAll();
        List<RoleSimpleVo> result = roles.stream()
                .map(RoleSimpleVo::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
