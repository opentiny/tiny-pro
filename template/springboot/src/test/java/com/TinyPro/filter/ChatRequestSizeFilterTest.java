package com.TinyPro.filter;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatRequestSizeFilterTest {

    @Test
    void rejectsChatRequestWhenContentLengthExceedsLimit() throws Exception {
        ChatRequestSizeFilter filter = new ChatRequestSizeFilter(10);
        MockHttpServletRequest request = chatRequest();
        request.setContent("01234567890".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        filter.doFilter(request, response, chain(chainCalled, false));

        assertEquals(413, response.getStatus());
        assertFalse(chainCalled.get());
    }

    @Test
    void allowsChatRequestWithinLimit() throws Exception {
        ChatRequestSizeFilter filter = new ChatRequestSizeFilter(10);
        MockHttpServletRequest request = chatRequest();
        request.setContent("0123456789".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        filter.doFilter(request, response, chain(chainCalled, true));

        assertTrue(chainCalled.get());
        assertEquals(200, response.getStatus());
    }

    private MockHttpServletRequest chatRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/robot/chat/completions");
        request.setContentType("application/json");
        return request;
    }

    private FilterChain chain(AtomicBoolean called, boolean consumeBody) {
        return (request, response) -> {
            if (consumeBody) {
                request.getInputStream().readAllBytes();
            }
            called.set(true);
        };
    }
}
