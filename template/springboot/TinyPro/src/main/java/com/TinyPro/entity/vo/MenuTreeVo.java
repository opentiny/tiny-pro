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

    // 新增：返回二维数组的方法
    public List<List<MenuTreeVo>> toDoubleArrayFormat() {
        List<MenuTreeVo> mainList = this.toSingleTree(); // 将当前对象转为单树结构
        List<MenuTreeVo> emptyList = List.of(); // 空数组

        return List.of(mainList, emptyList); // 返回二维数组
    }

    // 将当前对象转为单节点树结构
    private List<MenuTreeVo> toSingleTree() {
        // 如果当前是根节点，直接返回包含自身的列表
        if (this.parentId == null) {
            return List.of(this);
        }
        // 如果不是根节点，构建一个虚拟根节点
        MenuTreeVo virtualRoot = new MenuTreeVo();
        virtualRoot.getChildren().add(this);
        return List.of(virtualRoot);
    }

}