package com.TinyPro.exception;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.utils.LocaleUntil;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @Autowired
    private MessageSource messageSource;

    public GlobalExceptionHandler() {

    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        if (ex instanceof  BusinessException){
            BusinessException exception=  (BusinessException) ex;
            // 根据错误码和参数获取国际化错误消息
            String message = messageSource.getMessage(
                    exception.getErrorCode(),
                    new Object[]{exception.getArgs()},
                    LocaleUntil.getLocale()
            );

            // 创建自定义的错误响应对象，可以包含错误信息和状态码数值
            ErrorResponse errorResponse = new ErrorResponse(message, exception.getHttpStatus().value());

            return ResponseEntity
                    .status(exception.getHttpStatus())
                    .body(errorResponse);
        } else if (ex instanceof MethodArgumentNotValidException || ex instanceof ConstraintViolationException) {
            MethodArgumentNotValidException exception= (MethodArgumentNotValidException) ex;
            String errorMsg = exception.getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .map(error -> MessageFormat.format(error.getDefaultMessage(),error.getField()))
                    .collect(Collectors.joining(", "));
            // 创建自定义的错误响应对象，可以包含错误信息和状态码数值
            BusinessException e = new BusinessException(errorMsg, HttpStatus.BAD_REQUEST, null);
            NoExistErrorResponse errorResponse = new NoExistErrorResponse(new String[]{errorMsg}, e.getHttpStatus().value(), Contants.NO_EXIST_ERROR_RESPONSE);

            return ResponseEntity
                    .status(e.getHttpStatus())
                    .body(errorResponse);
        } else {
            ErrorResponse errorResponse = new ErrorResponse(Contants.PUBLIC_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }
}