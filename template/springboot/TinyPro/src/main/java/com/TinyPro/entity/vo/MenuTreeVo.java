package com.TinyPro.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MenuTreeVo {
    private Integer id;
    private String label;      // 对应Menu的name
    private List<MenuTreeVo> children;
    private String url;        // 对应Menu的path
    private String component;
    private String customIcon; // 对应Menu的icon
    private String menuType;
    private Integer parentId;
    private Integer order;
    private String locale;

    public MenuTreeVo(Integer id, String name, ArrayList<MenuTreeVo> children) {
    }
}