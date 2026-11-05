package com.TinyPro.mock;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Backward-compatible factory name for the NestJS mock response envelope.
 * The JSON contract is: { data, errMsg, code }.
 */
@Data
@AllArgsConstructor
public class ApiResponse<T> {

    private T data;
    private String errMsg;
    private String code;

    public static <T> ApiResponse<T> success(T data) {
        return successSimple(data);
    }

    public static <T> ApiResponse<T> success(T data, String msg, Integer ignoredCode) {
        return successSimple(data);
    }


    public static <T> ApiResponse<T> successSimple(T data) {
        return successSimple(data, "", "0");
    }

    public static <T> ApiResponse<T> successSimple(T data, String errMsg, String code) {
        return new ApiResponse<>(data, errMsg, code);
    }

   
}
