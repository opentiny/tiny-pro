package com.TinyPro.entity.vo;

import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import lombok.Data;

import java.util.List;
@Data
public class RolePMVo {
    private PageWrapper<Role> roleInfo;
    private List<List<MenuTreeVo>> menuTree;
    public void setMenuTree(MenuTreeVo menuTree) {
        this.menuTree = menuTree.toDoubleArrayFormat();
    }
}
