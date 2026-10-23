package com.TinyPro.config;

import jakarta.annotation.PostConstruct;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Fails fast when the production profile is missing deployment credentials.
 */
@Component
public class ProductionEnvironmentValidator {

    private static final List<String> REQUIRED_VARIABLES = List.of(
            "DATABASE_URL",
            "DATABASE_USERNAME",
            "DATABASE_PASSWORD",
            "REDIS_HOST",
            "REDIS_PASSWORD",
            "JWT_SECRET"
    );

    private final Environment environment;

    public ProductionEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validate() {
        if (!isProductionProfileActive()) {
            return;
        }

        List<String> missing = REQUIRED_VARIABLES.stream()
                .filter(name -> isBlank(System.getenv(name)))
                .toList();
        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    "Missing required production environment variables: " + String.join(", ", missing));
        }
    }

    private boolean isProductionProfileActive() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
