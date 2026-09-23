package com.TinyPro.config;

import com.TinyPro.annotation.IsPublic;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.customizers.OperationCustomizer;

import java.util.Collections;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Value("${SWAGGER_TITLE:Tiny Pro}")
    private String title;

    @Value("${SWAGGER_DESC:Tiny Pro SpringBoot backend API}")
    private String description;

    @Value("${SWAGGER_VERSION:1.0.0}")
    private String version;

    @Bean
    public OpenAPI tinyProOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .description(description)
                        .version(version))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }

    @Bean
    public OperationCustomizer publicOperationCustomizer() {
        return (operation, handlerMethod) -> {
            boolean isPublic = handlerMethod.hasMethodAnnotation(IsPublic.class)
                    || handlerMethod.getBeanType().isAnnotationPresent(IsPublic.class);
            if (isPublic) {
                operation.setSecurity(Collections.emptyList());
            }
            return operation;
        };
    }
}
