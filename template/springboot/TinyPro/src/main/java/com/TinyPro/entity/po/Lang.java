package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.List;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Lang implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @TableId(type = IdType.AUTO)
    private Integer id;

    @Column(nullable = false)
    private String name;

    // 假设 Lang 和 I18 是一对多关系
    @OneToMany( targetEntity = I18.class, fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST})
    @JsonIgnoreProperties(value = {"1"})
    @JoinColumn(name = "lang_id",
            referencedColumnName = "id",
            insertable = false,
            updatable = false )
    private List<I18> i18;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<I18> getI18() {
        return i18;
    }

    public void setI18(List<I18> i18) {
        this.i18 = i18;
    }
}