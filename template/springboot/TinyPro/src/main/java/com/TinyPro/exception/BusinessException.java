package com.TinyPro.exception;

import com.TinyPro.entity.enums.ResponseCodeEnum;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
public class BusinessException extends RuntimeException{
    private String errorCode;
    private Object args;
    private HttpStatus httpStatus;

    public BusinessException(String errorCode) {
        this.errorCode = errorCode;
    }

    public BusinessException(String errorCode, HttpStatus httpStatus, Object args) {
        this.errorCode = errorCode;
        this.httpStatus=httpStatus;
        this.args = args;
    }
}
