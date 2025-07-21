package com.TinyPro.config;

import com.TinyPro.filter.AuthFilter;
import com.TinyPro.filter.RejectRequestFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<AuthFilter> loginFilterRegistration() {
    FilterRegistrationBean<AuthFilter> registration = new FilterRegistrationBean<>();
     registration.setFilter(new AuthFilter());
        registration.addUrlPatterns("/*"); // 过滤所有请求
        registration.setName("AuthFilter");
        registration.setOrder(1); // 设置过滤器顺序
        return registration;
    }
    @Bean
    public FilterRegistrationBean<RejectRequestFilter> rejectFilter() {
        FilterRegistrationBean<RejectRequestFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new RejectRequestFilter());
        bean.addUrlPatterns("/*");   // 拦截所有请求
        return bean;
    }
}
