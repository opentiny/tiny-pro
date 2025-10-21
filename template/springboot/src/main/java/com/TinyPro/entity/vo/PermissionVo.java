package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Permission;
import lombok.Data;

@Data
public class PermissionVo {
    private Integer id;
    private String name;
    private String desc;

    // 修正：添加 static 修饰符
    public static PermissionVo fromEntity(Permission permission) {
        PermissionVo vo = new PermissionVo();
        vo.setId(permission.getId());
        vo.setName(permission.getName());
        vo.setDesc(permission.getDesc());
        return vo;
    }
}