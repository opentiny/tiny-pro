package com.TinyPro.utils;

import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

public class LocaleUntil {
    public static Locale getLocale(){
        return LocaleContextHolder.getLocale();
    }
}
