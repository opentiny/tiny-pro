package com.TinyPro.exception;

import com.TinyPro.entity.enums.ResponseCodeEnum;
import lombok.Data;

@Data
public class BusinessException extends RuntimeException{
    private String errorCode;
    private Object[] args;

    public BusinessException(String errorCode) {
        this.errorCode = errorCode;
    }

    public BusinessException(String errorCode, Object[] args) {
        this.errorCode = errorCode;
        this.args = args;
    }
}