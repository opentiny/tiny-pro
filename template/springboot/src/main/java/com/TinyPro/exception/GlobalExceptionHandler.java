package com.TinyPro.exception;

import com.TinyPro.utils.LocaleUntil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    public GlobalExceptionHandler() {

    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleException(BusinessException ex) {
        // 根据错误码和参数获取国际化错误消息
        String message = messageSource.getMessage(
                ex.getErrorCode(),
                new Object[]{ex.getArgs()},
                LocaleUntil.getLocale()
        );

        // 创建自定义的错误响应对象，可以包含错误信息和状态码数值
        ErrorResponse errorResponse = new ErrorResponse(new String[]{message}, ex.getHttpStatus().value());

        return ResponseEntity
                .status(ex.getHttpStatus())
                .body(errorResponse);
    }
}
