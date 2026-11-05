package com.TinyPro.exception;

import com.TinyPro.entity.dto.ApplicationPaginationQueryDto;
import org.junit.jupiter.api.Test;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

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

    @Test
    void returnsNotFoundForMissingResources() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/missing");

        ResponseEntity<?> response = handler.handleNoResourceFoundException(
                new NoResourceFoundException(HttpMethod.GET, "/missing"), request);

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode().value());
        assertEquals(HttpStatus.NOT_FOUND.getReasonPhrase(),
                ((ErrorResponse) response.getBody()).getMessage());
    }

    @Test
    void formatsEnglishForbiddenMessageWithPositionalArgument() {
        String pattern = ResourceBundle
                .getBundle("i18n.messages", Locale.US)
                .getString("common.forbidden");

        assertEquals("Need `api-token-owner` permission, but you don't have it",
                MessageFormat.format(pattern, "api-token-owner"));
    }

    @Test
    void formatsPaginationValidationMessageWithFieldAndConstraintArguments() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames("i18n.messages");
        messageSource.setDefaultEncoding("UTF-8");
        ReflectionTestUtils.setField(handler, "messageSource", messageSource);
        LocaleContextHolder.setLocale(Locale.SIMPLIFIED_CHINESE);

        try {
            ApplicationPaginationQueryDto target = new ApplicationPaginationQueryDto();
            BeanPropertyBindingResult bindingResult =
                    new BeanPropertyBindingResult(target, "searchInfo");
            bindingResult.addError(new FieldError(
                    "searchInfo",
                    "page",
                    0,
                    false,
                    new String[]{"Min.searchInfo.page", "Min.page", "Min"},
                    null,
                    "{0} 不能小于 {1}"));

            ResponseEntity<?> response = handler.handleException(
                    new MethodArgumentNotValidException(null, bindingResult),
                    new MockHttpServletRequest("GET", "/application"));

            assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());
            NoExistErrorResponse body = (NoExistErrorResponse) response.getBody();
            assertEquals("页码 不能小于 1", body.getMessage()[0]);
        } finally {
            LocaleContextHolder.resetLocaleContext();
        }
    }
}
