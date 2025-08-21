package com.TinyPro.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.text.MessageFormat;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ParameterExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> MessageFormat.format(error.getDefaultMessage(),error.getField()))
                .collect(Collectors.joining(", "));
        // 创建自定义的错误响应对象，可以包含错误信息和状态码数值
        BusinessException e = new BusinessException(errorMsg, HttpStatus.BAD_REQUEST, null);
        ErrorResponse errorResponse = new ErrorResponse(new String[]{errorMsg}, e.getHttpStatus().value());

        return ResponseEntity
                .status(e.getHttpStatus())
                .body(errorResponse);
    }
}