package com.TinyPro.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})  // 表示可以标注在方法或类上
@Retention(RetentionPolicy.RUNTIME)
public @interface Reject {
}
