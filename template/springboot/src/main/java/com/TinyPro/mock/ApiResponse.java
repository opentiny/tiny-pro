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

    public static <T> ApiResponse<T> fail(T data, String ignoredMsg, Integer ignoredCode) {
        return failSimple(data, "request failed", "500");
    }

    public static <T> ApiResponse<T> fail(T data, String ignoredMsg) {
        return failSimple(data, "request failed", "500");
    }

    public static <T> ApiResponse<T> fail(T data) {
        return failSimple(data, "request failed", "500");
    }

    public static <T> ApiResponse<T> successSimple(T data) {
        return successSimple(data, "", "0");
    }

    public static <T> ApiResponse<T> successSimple(T data, String errMsg, String code) {
        return new ApiResponse<>(data, errMsg, code);
    }

    public static <T> ApiResponse<T> failSimple(T data, String errMsg, String code) {
        return new ApiResponse<>(data, errMsg, code);
    }

    public static <T> ApiResponse<T> failSimple(T data, String errMsg) {
        return failSimple(data, errMsg, "500");
    }

    public static <T> ApiResponse<T> failSimple(T data) {
        return failSimple(data, "request failed", "500");
    }

    public static <T> ApiResponse<T> successWrapper(T data) {
        return successSimple(data);
    }

    public static <T> ApiResponse<T> failWrapper(T data, String msg, Integer code) {
        return failSimple(data, msg, String.valueOf(code));
    }

    public static <T> ApiResponse<T> successWrapperSimple(T data) {
        return successSimple(data);
    }

    public static <T> ApiResponse<T> failWrapperSimple(T data, String errMsg, String code) {
        return failSimple(data, errMsg, code);
    }
}
