package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateMenuDto;
import com.TinyPro.entity.dto.UpdateMenuDto;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.MenuVo;
import com.TinyPro.exception.BusinessException;

import com.TinyPro.service.IMenuService;
import com.TinyPro.jpa.IMenuRepository;
import com.TinyPro.jpa.IRoleRepository;
import com.TinyPro.jpa.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
 public class IMenuServiceImpl  implements IMenuService {
    @Autowired
    private IMenuRepository menuRepository;
    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private IRoleRepository iRoleRepository;
    @Override
    public List<Integer> getMenuAllId() {
        return null;
    }

    @Override
    public ResponseEntity<List<MenuVo>> getMenubyEmail(String email) {
        // 1. 通过email获取用户
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 2. 获取用户的所有角色ID
        Set<Integer> roleIds = user.getRole().stream()
                .map(Role::getId)
                .collect(Collectors.toSet());

        if (roleIds.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // 3. 获取这些角色关联的所有菜单
        List<Menu> menus = menuRepository.findMenusByRoleIds(roleIds);

        if (menus.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // 4. 构建菜单树
        List<MenuVo> menuTree = buildMenuTree(menus);
        return ResponseEntity.ok(menuTree);
    }

    @Override
    public ResponseEntity<List<MenuVo>> findAllMenu() {
        // 1. 查询所有菜单并按order排序
        List<Menu> menus = menuRepository.findAllMenus();

        if (menus.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // 2. 构建菜单树
        List<MenuVo> menuTree = buildMenuTree(menus);
        return ResponseEntity.ok(menuTree);
    }

    @Override
    public ResponseEntity<Menu> createMenu(CreateMenuDto createMenuDto, boolean isInit) {
        // 从DTO中获取参数
        Integer order = createMenuDto.getOrder();
        String menuType = createMenuDto.getMenuType();
        String name = createMenuDto.getName();
        String path = createMenuDto.getPath();
        String component = createMenuDto.getComponent();
        String icon = createMenuDto.getIcon();
        Integer parentId = createMenuDto.getParentId();
        String locale = createMenuDto.getLocale();

        // 检查菜单是否已存在
        Optional<Menu> existingMenu = menuRepository.findByNameAndOrderAndMenuTypeAndParentIdAndPathAndIconAndComponentAndLocale(
                name, order, menuType, parentId, path, icon, component, locale
        );

        if (isInit && existingMenu.isPresent()) {
            return ResponseEntity.ok(existingMenu.get());
        }

        if (existingMenu.isPresent() && !isInit) {
            throw new BusinessException("exception.menu.exists", HttpStatus.BAD_REQUEST, null);
        }

        // 创建新菜单
        Menu newMenu = new Menu();
        newMenu.setName(name);
        newMenu.setPath(path);
        newMenu.setComponent(component);
        newMenu.setParentId(parentId);
        newMenu.setMenuType(menuType);
        newMenu.setIcon(icon);
        newMenu.setOrder(order);
        newMenu.setLocale(locale);

        return ResponseEntity.ok(menuRepository.save(newMenu));
    }

    @Override
    public ResponseEntity<Boolean> updateMenu(UpdateMenuDto updateMenuDto) {
        Menu menu = menuRepository.findById(Long.valueOf(updateMenuDto.getId()))
                .orElseThrow(() -> new BusinessException("Menu not found"));

        menu.setName(updateMenuDto.getName());
        menu.setPath(updateMenuDto.getPath());
        menu.setComponent(updateMenuDto.getComponent());
        menu.setParentId(updateMenuDto.getParentId());
        menu.setMenuType(updateMenuDto.getMenuType());
        menu.setIcon(updateMenuDto.getIcon());
        menu.setOrder(updateMenuDto.getOrder());
        menu.setLocale(updateMenuDto.getLocale());
        menuRepository.save(menu);
        return ResponseEntity.ok(true);
    }

    @Override
    @Transactional
    public ResponseEntity<Menu> deleteMenu(Integer id, Integer parentId) {
        try {
            //  先删除role_menu关联记录
            iRoleRepository.deleteByMenuId(id);
            // 查找要删除的菜单
            Menu menu = menuRepository.findById(Long.valueOf(id))
                    .orElseThrow(() -> new BusinessException("Menu not found with id: " + id));

            // 查找所有子菜单
            List<Menu> childMenus = menuRepository.findByParentId(id);

            // 更新子菜单的parentId
            for (Menu childMenu : childMenus) {
                childMenu.setParentId(parentId == -1 ? null : parentId);
                menuRepository.save(childMenu);
            }

            // 删除菜单
            menuRepository.delete(menu);
            return ResponseEntity.ok(menu);
        } catch (Exception e) {
            throw new BusinessException("Failed to delete menu");
        }
    }

    /**
     * 构建菜单树形结构
     */
    private List<MenuVo> buildMenuTree(List<Menu> menus) {
        // 使用Map存储所有菜单，便于快速查找
        Map<Integer, MenuVo> menuMap = new HashMap<>();

        // 先转换所有菜单为VO对象
        menus.forEach(menu -> menuMap.put(menu.getId(), convertToVo(menu)));

        // 构建树形结构
        List<MenuVo> rootMenus = new ArrayList<>();
        menuMap.values().forEach(menuVo -> {
            Integer parentId = menuVo.getParentId();
            if (parentId == null || !menuMap.containsKey(parentId)) {
                rootMenus.add(menuVo);
            } else {
                MenuVo parentMenu = menuMap.get(parentId);
                if (parentMenu.getChildren() == null) {
                    parentMenu.setChildren(new ArrayList<>());
                }
                parentMenu.getChildren().add(menuVo);
            }
        });

        // 对菜单进行排序
        rootMenus.sort(Comparator.comparing(MenuVo::getOrder));
        rootMenus.forEach(menu -> {
            if (menu.getChildren() != null) {
                menu.getChildren().sort(Comparator.comparing(MenuVo::getOrder));
            }
        });

        return rootMenus;
    }

    /**
     * 将Menu实体转换为MenuVo
     */
    private MenuVo convertToVo(Menu menu) {
        MenuVo vo = new MenuVo();
        vo.setId(menu.getId());
        vo.setLabel(menu.getName());
        vo.setParentId(menu.getParentId());
        vo.setOrder(menu.getOrder());
        vo.setUrl(menu.getPath());
        vo.setComponent(menu.getComponent());
        vo.setCustomIcon(menu.getIcon());
        vo.setLocale(menu.getLocale());
        vo.setMenuType(menu.getMenuType());
        vo.setChildren(new ArrayList<>());
        return vo;
    }
}