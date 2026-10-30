package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

import java.io.Serializable;

/**
 * Menu identity uniqueness is managed by Flyway migration
 * V2__align_menu_identity.sql through the generated _menu_identity_hash column.
 */
@Entity
@Table(name = "menu")
@Data
@DynamicUpdate
public class Menu implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false)
    private String name;
    @Column(name = "`order`")
    @TableField("'order'")
    private Integer order;
    @Column(name = "parentId")
    private Integer parentId;
    @Column(name = "menuType")
    private String menuType;
    @Column(name = "icon")
    private String icon;
    @Column(name = "component")
    private String component;
    @Column(name = "path")
    private String path;
    @Column(name = "locale")
    private String locale;
}
