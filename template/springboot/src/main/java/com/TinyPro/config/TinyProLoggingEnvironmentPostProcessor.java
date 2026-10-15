package com.TinyPro.config;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.context.properties.bind.BindException;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validates logging values before Spring Boot asks Logback to build its appenders.
 */
public class TinyProLoggingEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        TinyProProperties.Logging logging;
        try {
            logging = Binder.get(environment)
                    .bind("tinypro.logging", Bindable.of(TinyProProperties.Logging.class))
                    .orElseGet(TinyProProperties.Logging::new);
        } catch (BindException exception) {
            throw new IllegalStateException("Invalid tinypro.logging configuration", exception);
        }

        Set<ConstraintViolation<TinyProProperties.Logging>> violations = validator.validate(logging);
        if (!violations.isEmpty()) {
            String details = violations.stream()
                    .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                    .sorted()
                    .collect(Collectors.joining(", "));
            throw new IllegalStateException("Invalid tinypro.logging configuration: " + details);
        }
    }

    @Override
    public int getOrder() {
        // Run after application.properties and profile-specific config have
        // been loaded, but before LoggingApplicationListener initializes Logback.
        return ConfigDataEnvironmentPostProcessor.ORDER + 1;
    }
}
