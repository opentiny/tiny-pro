package com.TinyPro.config;

import com.TinyPro.filter.UserGuardsFilter;
import com.TinyPro.filter.RejectInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private UserGuardsFilter authInterceptor;
    @Autowired
    private RejectInterceptor rejectInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")     // 拦截所有
                .excludePathPatterns("/auth/login", "/swagger-ui/**", "/error");
        registry.addInterceptor(rejectInterceptor)
                .addPathPatterns("/**"); // 白名单
    }


    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // 开启后缀模式匹配，使/user/info和/user/info/都能匹配
        configurer.setUseTrailingSlashMatch(true);
    }
}