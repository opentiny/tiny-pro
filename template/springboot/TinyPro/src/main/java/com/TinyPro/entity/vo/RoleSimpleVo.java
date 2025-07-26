package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Role;
import lombok.Data;

@Data
public class RoleSimpleVo {
    private Integer id;
    private String name;

    public static RoleSimpleVo fromEntity(Role role) {
        RoleSimpleVo dto = new RoleSimpleVo();
        dto.setId(role.getId());
        dto.setName(role.getName());
        return dto;
    }
}