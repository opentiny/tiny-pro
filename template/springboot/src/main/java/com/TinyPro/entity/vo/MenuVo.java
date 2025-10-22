package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Menu;
import lombok.Data;

import java.util.List;

@Data
public class MenuVo{
    private Integer id;
    private String label;
    private Integer order;
    private Integer parentId;
    private String menuType;
    private String customIcon;
    private String component;
    private String url;
    private String locale;
    private List<MenuVo> children;
}
