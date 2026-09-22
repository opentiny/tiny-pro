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


@Entity
@Table(
        name = "menu",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_menu_identity",
                columnNames = {
                        "name", "order", "menuType", "parentId",
                        "path", "icon", "component", "locale"
                }
        )
)
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
