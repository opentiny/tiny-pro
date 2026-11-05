package com.TinyPro.config;

import com.TinyPro.controller.HealthCheckController;
import com.TinyPro.filter.UserGuardsFilter;
import com.TinyPro.filter.RejectInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${tinypro.api-prefix:/api}")
    private String apiPrefix;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        String prefix = normalizePrefix(apiPrefix);
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")     // 拦截所有
                .excludePathPatterns(
                        "/auth/login",
                        prefix + "/auth/login",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/webjars/**",
                        "/healthCheck",
                        "/actuator/**",
                        "/error"
                );
        registry.addInterceptor(rejectInterceptor)
                .addPathPatterns("/**"); // 白名单
    }


    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // 开启后缀模式匹配，使/user/info和/user/info/都能匹配
        configurer.setUseTrailingSlashMatch(true);

        String prefix = normalizePrefix(apiPrefix);
        if (!prefix.isEmpty()) {
            configurer.addPathPrefix(prefix, handlerType ->
                    (handlerType.getPackageName().equals("com.TinyPro.controller")
                            || handlerType.getPackageName().equals("com.TinyPro.mock"))
                            && handlerType != HealthCheckController.class);
        }
    }

    private String normalizePrefix(String prefix) {
        if (prefix == null || prefix.isBlank() || "/".equals(prefix.trim())) {
            return "";
        }
        String normalized = prefix.trim();
        while (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.startsWith("/") ? normalized : "/" + normalized;
    }
}
