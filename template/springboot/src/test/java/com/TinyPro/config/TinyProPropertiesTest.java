package com.TinyPro.config;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
}
