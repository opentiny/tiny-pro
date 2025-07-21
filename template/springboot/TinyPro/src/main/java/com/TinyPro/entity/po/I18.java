package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Entity
@TableName("i18")
public class I18 implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "`key`")
    private String key;

    @Column(name = "content",length = 65535)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lang_id")
    @TableField(select = false)
    private Lang lang;
}