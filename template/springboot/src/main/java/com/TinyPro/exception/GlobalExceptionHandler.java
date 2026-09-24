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
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.text.MessageFormat;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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

        if (ex instanceof ResponseStatusException statusException) {
            logger.warn("Request rejected: {} {} -> {} ({})",
                    request.getMethod(), request.getRequestURI(),
                    statusException.getStatusCode().value(), statusException.getReason());
            int status = statusException.getStatusCode().value();
            HttpStatus knownStatus = HttpStatus.resolve(status);
            String message = statusException.getReason() != null
                    ? statusException.getReason()
                    : knownStatus == null ? "Request failed" : knownStatus.getReasonPhrase();
            return ResponseEntity.status(status).body(new ErrorResponse(message, status));
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

        if (ex instanceof DataIntegrityViolationException
                || ex instanceof org.hibernate.exception.ConstraintViolationException) {
            logger.error("Database constraint violation for {} {}",
                    request.getMethod(), request.getRequestURI(), ex);
        } else {
            logger.error("Unhandled exception for {} {}",
                    request.getMethod(), request.getRequestURI(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(Contants.PUBLIC_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value()));
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
