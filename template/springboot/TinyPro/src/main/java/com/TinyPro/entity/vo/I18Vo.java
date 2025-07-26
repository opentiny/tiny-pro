package com.TinyPro.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data   // lombok
@AllArgsConstructor
public class I18Vo {
    private Integer id;
    private String key;
    private String content;
    private LangVo lang;   // 内嵌 Lang 的简化对象
}