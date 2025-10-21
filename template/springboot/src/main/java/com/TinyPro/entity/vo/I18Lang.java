package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Lang;
import jakarta.persistence.Column;
import lombok.Data;

@Data
public class I18Lang  extends Lang {
    private Integer id;
    @Column(name = "`key`")
    private String key;

    @Column(name = "content",length = 65535)
    private String content;
}
