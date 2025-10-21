package com.TinyPro.entity.page;

import lombok.Data;

@Data
public class Link {
    private String first; //第一页路由
    private String previous; //上一页路由
    private String next; //下一页路由
    private String last; //最后一页路由
}
