package com.TinyPro.config;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.env.MockEnvironment;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TinyProPropertiesTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsValidConfiguration() {
        TinyProProperties properties = new TinyProProperties();
        properties.getJwt().setSecret("a-valid-secret");

        assertTrue(validator.validate(properties).isEmpty());
    }

    @Test
    void rejectsBlankJwtSecretAndInvalidLogSize() {
        TinyProProperties properties = new TinyProProperties();
        properties.getJwt().setSecret(" ");
        properties.getLogging().setMaxFileSize("not-a-size");

        assertFalse(validator.validate(properties).isEmpty());
    }

    @Test
    void acceptsLogbackSizeUnits() {
        TinyProProperties properties = new TinyProProperties();
        properties.getJwt().setSecret("a-valid-secret");
        properties.getLogging().setMaxFileSize("1GB");
        properties.getLogging().setTotalSizeCap("512MB");

        assertTrue(validator.validate(properties).isEmpty());
    }

    @Test
    void rejectsUnitsUnsupportedByLogback() {
        TinyProProperties properties = new TinyProProperties();
        properties.getJwt().setSecret("a-valid-secret");
        properties.getLogging().setMaxFileSize("1TB");

        assertFalse(validator.validate(properties).isEmpty());
    }

    @Test
    void rejectsInvalidLoggingConfigurationBeforeLogbackInitialization() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("tinypro.logging.max-file-size", "not-a-size");

        assertThrows(IllegalStateException.class, () ->
                new TinyProLoggingEnvironmentPostProcessor().postProcessEnvironment(environment, null));
    }

    @Test
    void rejectsEnvironmentLoggingValueBeforeLogbackInitialization() {
        SpringApplication application = new SpringApplication(LoggingValidationApplication.class);
        application.setWebApplicationType(WebApplicationType.NONE);
        application.setDefaultProperties(Map.of(
                "LOG_MAX_FILE_SIZE", "abc",
                "spring.main.banner-mode", "off"
        ));

        IllegalStateException exception = assertThrows(IllegalStateException.class, application::run);

        assertTrue(exception.getMessage().contains("Invalid tinypro.logging configuration"));
    }

    @Configuration(proxyBeanMethods = false)
    static class LoggingValidationApplication {
    }
}
