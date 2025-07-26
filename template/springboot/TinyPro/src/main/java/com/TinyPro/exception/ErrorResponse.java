package com.TinyPro.exception;

import lombok.Data;

@Data
public final class ErrorResponse {
    private String message;
    private int status;

    // 构造函数、getter和setter省略
    public ErrorResponse(String message, int status) {
        this.message = message;
        this.status = status;
    }
}
