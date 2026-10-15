package com.TinyPro.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;
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
    void mapsSpringErrorResponseStatus() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/missing");

        ResponseEntity<?> response = handler.handleException(
                new NoResourceFoundException(org.springframework.http.HttpMethod.GET, "/missing"), request);

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode().value());
        assertEquals(HttpStatus.NOT_FOUND.value(), ((ErrorResponse) response.getBody()).getStatusCode());
    }

    @Test
    void hidesDetailsForServerErrorResponse() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/user");

        ResponseEntity<?> response = handler.handleException(
                new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "SQL connection details must not be returned"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getStatusCode().value());
        assertEquals(com.TinyPro.entity.contants.Contants.PUBLIC_ERROR,
                ((ErrorResponse) response.getBody()).getMessage());
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

    @Test
    void mapsUniqueConstraintViolationToConflict() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/user");
        ConstraintViolationException cause = new ConstraintViolationException(
                "duplicate user email", null, "uk_user_email");

        ResponseEntity<?> response = handler.handleException(
                new DataIntegrityViolationException("could not insert", cause), request);

        assertEquals(HttpStatus.CONFLICT.value(), response.getStatusCode().value());
        assertEquals(HttpStatus.CONFLICT.value(), ((ErrorResponse) response.getBody()).getStatusCode());
    }

    @Test
    void keepsForeignKeyViolationAsServerError() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/i18");
        ConstraintViolationException cause = new ConstraintViolationException(
                "foreign key violation", null, "fk_i18_lang");

        ResponseEntity<?> response = handler.handleException(
                new DataIntegrityViolationException("could not insert", cause), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getStatusCode().value());
        assertEquals(com.TinyPro.entity.contants.Contants.PUBLIC_ERROR,
                ((ErrorResponse) response.getBody()).getMessage());
    }
}
