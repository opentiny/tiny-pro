package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "i18")
@Data
public class I18 implements Serializable {
    @Id
    @TableId(type = IdType.AUTO)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

//    @ManyToOne(targetEntity = Lang.class, fetch = FetchType.EAGER, cascade = {CascadeType.ALL})
//    @JsonIgnoreProperties(value = {"1"})
//    @JoinColumn(name = "lang_id",
//            referencedColumnName = "id",
//            insertable = false,
//            updatable = false )
//    private Lang lang;

    @NotBlank
    @Column(name = "`key`", nullable = false)
    @TableField("`key`")
    private String key;

    @Column(nullable = false)
    private String content;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

//    public Lang getLang() {
//        return lang;
//    }
//
//    public void setLang(Lang lang) {
//        this.lang = lang;
//    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}