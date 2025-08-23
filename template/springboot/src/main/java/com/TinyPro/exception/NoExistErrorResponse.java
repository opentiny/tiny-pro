package com.TinyPro.exception;

import lombok.Data;

@Data
public class NoExistErrorResponse {
    private String[] message;
    private int statusCode;
    private String error;

    // 构造函数、getter和setter省略
    public NoExistErrorResponse(String[] message, int status,String error) {
        this.message = message;
        this.statusCode = status;
        this.error = error;
    }
}
