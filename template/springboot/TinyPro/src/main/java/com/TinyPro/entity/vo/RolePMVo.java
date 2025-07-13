package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import lombok.Data;

import java.util.List;
@Data
public class RolePMVo {
    private Role role;
    private List<Menu> menus;
    private List<Permission> permission;
}
