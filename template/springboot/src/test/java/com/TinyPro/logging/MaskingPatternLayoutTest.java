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

    @Test
    void masksCompleteCookieHeaderValue() {
        String message = "Cookie: session=abc; refresh=def; theme=dark\n"
                + "Set-Cookie: session=ghi; refresh=jkl; Path=/; HttpOnly";

        String masked = MaskingPatternLayout.mask(message);

        assertTrue(masked.contains("Cookie: ******"), masked);
        assertTrue(masked.contains("Set-Cookie: ******"), masked);
        assertFalse(masked.contains("session=abc"));
        assertFalse(masked.contains("refresh=def"));
        assertFalse(masked.contains("session=ghi"));
        assertFalse(masked.contains("refresh=jkl"));
        assertFalse(masked.contains("HttpOnly"));
    }
}
