package com.TinyPro.config;

import com.TinyPro.filter.RejectRequestFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
    @Bean
    public FilterRegistrationBean<RejectRequestFilter> rejectFilter() {
        FilterRegistrationBean<RejectRequestFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new RejectRequestFilter());
        bean.addUrlPatterns("/*");   // 拦截所有请求
        return bean;
    }
}