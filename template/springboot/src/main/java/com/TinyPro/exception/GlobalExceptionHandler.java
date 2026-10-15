package com.TinyPro.exception;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.utils.LocaleUntil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.text.MessageFormat;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final Map<String, String> CONSTRAINT_MESSAGE_CODES = Map.of(
            "uk_permission_name", "exception.permission.conflict",
            "uk_role_name", "exception.role.uniqueConflict",
            "uk_lang_name", "exception.lang.conflict",
            "uk_user_email", "exception.user.userExists",
            "uk_menu_identity", "exception.menu.conflict",
            "uk_i18_lang_key", "exception.i18.conflict",
            "uk_application_name", "exception.application.conflict"
    );

    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex, HttpServletRequest request) {
        if (ex instanceof BusinessException businessException) {
            return handleBusinessException(businessException);
        }

        if (ex instanceof HttpMessageNotReadableException readableException) {
            Throwable cause = readableException.getMostSpecificCause();
            logger.warn("Malformed request body for {} {}: {}",
                    request.getMethod(), request.getRequestURI(), cause.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(HttpStatus.BAD_REQUEST.getReasonPhrase(),
                            HttpStatus.BAD_REQUEST.value()));
        }

        if (ex instanceof MethodArgumentNotValidException validationException) {
            String errorMessage = validationException.getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .map(error -> MessageFormat.format(error.getDefaultMessage(), error.getField()))
                    .collect(Collectors.joining(", "));
            logger.warn("Request validation failed: {} {} -> {}",
                    request.getMethod(), request.getRequestURI(), errorMessage);
            return validationError(errorMessage);
        }

        if (ex instanceof ConstraintViolationException validationException) {
            String errorMessage = validationException.getConstraintViolations()
                    .stream()
                    .map(error -> error.getPropertyPath() + ": " + error.getMessage())
                    .collect(Collectors.joining(", "));
            logger.warn("Request validation failed: {} {} -> {}",
                    request.getMethod(), request.getRequestURI(), errorMessage);
            return validationError(errorMessage);
        }

        if (ex instanceof org.springframework.web.ErrorResponse errorResponse) {
            HttpStatusCode statusCode = errorResponse.getStatusCode();
            int status = statusCode.value();
            if (status >= 500) {
                logger.error("Server error for {} {} -> {}",
                        request.getMethod(), request.getRequestURI(), status, ex);
                return ResponseEntity.status(status)
                        .body(new ErrorResponse(Contants.PUBLIC_ERROR, status));
            }

            String detail = errorResponse.getBody() == null
                    ? null
                    : errorResponse.getBody().getDetail();
            logger.warn("Request rejected: {} {} -> {} ({})",
                    request.getMethod(), request.getRequestURI(),
                    status, detail);
            HttpStatus knownStatus = HttpStatus.resolve(status);
            String message = detail != null && !detail.isBlank()
                    ? detail
                    : knownStatus == null ? "Request failed" : knownStatus.getReasonPhrase();
            return ResponseEntity.status(status).body(new ErrorResponse(message, status));
        }

        if (ex instanceof DataIntegrityViolationException
                || ex instanceof org.hibernate.exception.ConstraintViolationException) {
            String constraintName = findConstraintName(ex);
            if (constraintName != null && CONSTRAINT_MESSAGE_CODES.containsKey(constraintName)) {
                return handleDataIntegrityViolation(request, constraintName);
            }

            logger.error("Database integrity violation for {} {} (constraint={})",
                    request.getMethod(), request.getRequestURI(), constraintName, ex);
        } else {
            logger.error("Unhandled exception for {} {}",
                    request.getMethod(), request.getRequestURI(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(Contants.PUBLIC_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    private ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            HttpServletRequest request, String constraintName) {
        String messageCode = CONSTRAINT_MESSAGE_CODES.get(constraintName);
        String message = messageSource == null
                ? "Resource already exists or conflicts with the current state"
                : messageSource.getMessage(messageCode, null, LocaleUntil.getLocale());

        logger.warn("Database constraint violation for {} {} (constraint={})",
                request.getMethod(), request.getRequestURI(), constraintName);
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(message, HttpStatus.CONFLICT.value()));
    }

    private String findConstraintName(Throwable exception) {
        Throwable current = exception;
        while (current != null) {
            if (current instanceof org.hibernate.exception.ConstraintViolationException constraintException
                    && constraintException.getConstraintName() != null) {
                return constraintException.getConstraintName();
            }

            String detail = current.getMessage();
            if (detail != null) {
                for (String constraintName : CONSTRAINT_MESSAGE_CODES.keySet()) {
                    if (detail.contains(constraintName)) {
                        return constraintName;
                    }
                }
            }
            current = current.getCause();
        }
        return null;
    }

    private ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception) {
        HttpStatus status = exception.getHttpStatus() == null
                ? HttpStatus.INTERNAL_SERVER_ERROR
                : exception.getHttpStatus();
        String message = messageSource.getMessage(
                exception.getErrorCode(),
                new Object[]{exception.getArgs()},
                LocaleUntil.getLocale()
        );
        return ResponseEntity
                .status(status)
                .body(new ErrorResponse(message, status.value()));
    }

    private ResponseEntity<NoExistErrorResponse> validationError(String errorMessage) {
        NoExistErrorResponse errorResponse = new NoExistErrorResponse(
                new String[]{errorMessage},
                HttpStatus.BAD_REQUEST.value(),
                Contants.NO_EXIST_ERROR_RESPONSE
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}
