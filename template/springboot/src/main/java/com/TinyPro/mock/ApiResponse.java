package com.TinyPro.mock;

import lombok.Data;

@Data
public class ApiResponse<T> {

    private T data;
    private String status;
    private String msg;
    private Integer code;
    private String errMsg;
    private String strCode;


    private ApiResponse() {}

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "请求成功", 20000);
    }

    public static <T> ApiResponse<T> success(T data, String msg, Integer code) {
        ApiResponse<T> response = new ApiResponse<>();
        response.data = data;
        response.status = "ok";
        response.msg = msg;
        response.code = code;
        return response;
    }
    public static <T> ApiResponse<T> fail(T data, String msg, Integer code) {
        ApiResponse<T> response = new ApiResponse<>();
        response.data = data;
        response.status = "fail";
        response.msg = msg;
        response.code = code;
        return response;
    }

    public static <T> ApiResponse<T> fail(T data, String msg) {
        return fail(data, msg, 50000);
    }

    public static <T> ApiResponse<T> fail(T data) {
        return fail(data, "请求失败", 50000);
    }

    public static <T> ApiResponse<T> successSimple(T data) {
        return successSimple(data, "", "0");
    }

    public static <T> ApiResponse<T> successSimple(T data, String errMsg, String code) {
        ApiResponse<T> response = new ApiResponse<>();
        response.data = data;
        response.errMsg = errMsg;
        response.strCode = code;
        return response;
    }

    public static <T> ApiResponse<T> failSimple(T data, String errMsg, String code) {
        ApiResponse<T> response = new ApiResponse<>();
        response.data = data;
        response.errMsg = errMsg;
        response.strCode = code;
        return response;
    }

    public static <T> ApiResponse<T> failSimple(T data, String errMsg) {
        return failSimple(data, errMsg, "500");
    }

    public static <T> ApiResponse<T> failSimple(T data) {
        return failSimple(data, "请求失败", "500");
    }

    public static <T> ApiResponse<T> successWrapper(T data) {
        return success(data);
    }

    public static <T> ApiResponse<T> failWrapper(T data, String msg, Integer code) {
        return fail(data, msg, code);
    }

    public static <T> ApiResponse<T> successWrapperSimple(T data) {
        return successSimple(data);
    }

    public static <T> ApiResponse<T> failWrapperSimple(T data, String errMsg, String code) {
        return failSimple(data, errMsg, code);
    }
}