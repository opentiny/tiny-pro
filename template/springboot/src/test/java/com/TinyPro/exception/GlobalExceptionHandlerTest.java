package com.TinyPro.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void preservesResponseStatusExceptionStatus() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/application");

        ResponseEntity<?> response = handler.handleException(
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "application exists"), request);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());
        assertEquals("application exists", ((ErrorResponse) response.getBody()).getMessage());
    }

    @Test
    void logsAndHidesUnexpectedExceptionDetails() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/application");

        ResponseEntity<?> response = handler.handleException(
                new IllegalStateException("database password=should-not-be-returned"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getStatusCode().value());
        assertEquals(com.TinyPro.entity.contants.Contants.PUBLIC_ERROR,
                ((ErrorResponse) response.getBody()).getMessage());
    }
}
