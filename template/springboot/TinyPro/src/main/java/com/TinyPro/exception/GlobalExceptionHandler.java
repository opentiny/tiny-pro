package com.TinyPro.exception;

import com.TinyPro.utils.LocaleUntil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;

@ControllerAdvice
public class GlobalExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    public GlobalExceptionHandler() {

    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleException(BusinessException ex) {
        String message = messageSource.getMessage(ex.getErrorCode(), new Object[]{ex.getArgs()}, LocaleUntil.getLocale());
        ErrorResponse exception=new ErrorResponse(message,ex.getHttpStatus().value());
        return new ResponseEntity<>(exception, ex.getHttpStatus());
    }
}
