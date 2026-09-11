package com.TinyPro.logging;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MaskingPatternLayoutTest {

    @Test
    void masksCredentialsInCommonLogFormats() {
        String message = "password=admin token: abc123 "
                + "\"secret\":\"jwt-secret\" Authorization: Bearer jwt-token";

        String masked = MaskingPatternLayout.mask(message);

        assertTrue(masked.contains("password=******"));
        assertTrue(masked.contains("token: ******"));
        assertTrue(masked.contains("\"secret\":\"******\""), masked);
        assertTrue(masked.contains("Authorization: Bearer ******"));
        assertFalse(masked.contains("admin"));
        assertFalse(masked.contains("abc123"));
        assertFalse(masked.contains("jwt-secret"));
        assertFalse(masked.contains("jwt-token"));
    }
}
