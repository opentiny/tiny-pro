package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateRoleDto;
import com.TinyPro.entity.dto.UpdateRoleDto;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.entity.vo.RolePMVo;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.exception.BusinessException;

import com.TinyPro.service.IRoleService;
import com.TinyPro.jpa.IMenuRepository;
import com.TinyPro.jpa.IPermissionRepository;
import com.TinyPro.jpa.IRoleRepository;
import com.TinyPro.jpa.IUserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class IRoleServiceImpl implements IRoleService {
  @Autowired
  private IRoleRepository iRoleRepository;
  @Autowired
  private IPermissionRepository permissionService;
  @Autowired
  private IMenuRepository menuService;
  @Autowired
  private IUserRepository iUserRepository;
  @PersistenceContext
  private EntityManager entityManager;

  @Override
  public ResponseEntity<Role> createRole(CreateRoleDto createRoleDto, boolean isInit) {
    // 检查角色是否已存在
    Optional<Role> existingRole = iRoleRepository.findByName(createRoleDto.getName());

    if (isInit && existingRole.isPresent()) {
      return ResponseEntity.ok(existingRole.get());
    }

    if (existingRole.isPresent()) {
      throw new BusinessException("exception.role.exists", HttpStatus.BAD_REQUEST, null);
    }

    // 获取关联实体
    Set<Permission> permissions = permissionService.findAllById(
      createRoleDto.getPermissionIds() != null ? createRoleDto.getPermissionIds() : Collections.emptyList()
    ).stream().collect(Collectors.toSet());

    Set<Menu> menus = menuService.findAllById(
      createRoleDto.getMenuIds() != null ? createRoleDto.getMenuIds() : Collections.emptyList()
    ).stream().collect(Collectors.toSet());

    // 创建新角色
    Role newRole = new Role();
    newRole.setName(createRoleDto.getName());
    newRole.setPermission(permissions);
    newRole.setMenus(menus);

    return ResponseEntity.ok(iRoleRepository.save(newRole));
  }

  @Override
  public ResponseEntity<RolePMVo> findAllDetail(Integer page, Integer limit, String name) {
    // 构建分页参数
    Pageable pageable = PageRequest.of(
      page == null || page <= 0 ? 0 : page - 1,
      limit == null || limit <= 0 ? 10 : limit
    );

    // 构建查询条件
    Specification<Role> spec = (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      if (StringUtils.hasText(name)) {
        predicates.add(cb.like(root.get("name"), "%" + name + "%"));
      }
      return cb.and(predicates.toArray(new Predicate[0]));
    };

    Page<Role> rolePage = iRoleRepository.findAllWithAssociations(spec, pageable);
    List<Menu> menuList = menuService.findAll();

    PageWrapper<Role> rolePageWrapper = PageWrapper.of(rolePage);
    MenuTreeVo menuTreeVo = convertToTree(menuList);
    RolePMVo rolePMVo = new RolePMVo();
    rolePMVo.setRoleInfo(rolePageWrapper);
    rolePMVo.setMenuTree(menuTreeVo);
    return ResponseEntity.ok(rolePMVo);
  }

  private MenuTreeVo convertToTree(List<Menu> menus) {
    if (menus == null || menus.isEmpty()) {
      log.warn("菜单列表为空");
      return null;
    }

    Map<Integer, MenuTreeVo> map = new HashMap<>();
    MenuTreeVo root = null;

    // 第一遍：创建所有节点
    for (Menu menu : menus) {
      MenuTreeVo node = new MenuTreeVo();
      node.setId(menu.getId());
      node.setLabel(menu.getName());
      node.setUrl(menu.getPath());
      node.setComponent(menu.getComponent());
      node.setCustomIcon(menu.getIcon());
      node.setMenuType(menu.getMenuType());
      node.setParentId(menu.getParentId());
      node.setOrder(menu.getOrder());
      node.setLocale(menu.getLocale());

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
          if (parent.getChildren() == null) {
            parent.setChildren(new ArrayList<>());
          }
          parent.getChildren().add(map.get(menu.getId()));
        }
      }
    }

    return root;
  }

  @Override
  public ResponseEntity<Role> updateRole(UpdateRoleDto updateRoleDto) {
    // 查询角色
    Optional<Role> roleOptional = iRoleRepository.findById(Long.valueOf(updateRoleDto.getId()));
    if (roleOptional.isEmpty()) {
      throw new BusinessException("exception.role.notExists", HttpStatus.BAD_REQUEST, null);
    }
    Role role = roleOptional.get();
    List<Menu> allById = menuService.findAllById(updateRoleDto.getMenuIds());
    role.setMenus(allById.stream().collect(Collectors.toSet()));
    return ResponseEntity.ok(iRoleRepository.save(role));
  }

  @Override
  public ResponseEntity<List<Map<String, String>>> removeUserRById(Integer id) {
    // 1. 获取角色
    Role role = iRoleRepository.findById(Long.valueOf(id)).get();

    // 2. 获取所有关联该角色的用户
    List<User> usersWithRole = iUserRepository.findByRoleId(Long.valueOf(id));
    if (usersWithRole.isEmpty()) {
      throw new BusinessException("exception.role.conflict", HttpStatus.CONFLICT, null);
    }

    // 3. 从这些用户中移除该角色
    usersWithRole.forEach(user -> user.getRole().removeIf(r -> r.getId().equals(id)));
    iUserRepository.saveAll(usersWithRole);

    // 4. 删除角色
    iRoleRepository.delete(role);
    List<Map<String, String>> result = new ArrayList<>();
    Map<String, String> roleMap = new HashMap<>();
    roleMap.put("name", "测试员");
    result.add(roleMap);
    return ResponseEntity.ok(result);
  }

  @Override
  public ResponseEntity<List<RoleSimpleVo>> findAllRole() {
    List<Role> roles = iRoleRepository.findAll();
    List<RoleSimpleVo> result = roles.stream()
      .map(RoleSimpleVo::fromEntity)
      .collect(Collectors.toList());
    return ResponseEntity.ok(result);
  }

  @Override
  public ResponseEntity<Role> findOne(Integer id) {
    Optional<Role> role = iRoleRepository.findById(Long.valueOf(id));
    if (role.isEmpty()) {
      throw new BusinessException("exception.role.notExists", HttpStatus.NOT_FOUND, null);
    }
    return ResponseEntity.ok(role.get());
  }

  @Transactional
  public void deleteRoleWithRelations(Long roleId) {
    // 先删除关联记录
    entityManager.createNativeQuery("DELETE FROM user_role WHERE role_id = :roleId")
      .setParameter("roleId", roleId)
      .executeUpdate();

    // 再删除角色
    entityManager.createQuery("DELETE FROM Role r WHERE r.id = :roleId")
      .setParameter("roleId", roleId)
      .executeUpdate();
  }
}
