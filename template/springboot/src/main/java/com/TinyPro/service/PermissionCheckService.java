package com.TinyPro.service;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.exception.BusinessException;

import jakarta.servlet.http.HttpServletRequest;

import java.lang.reflect.Method;

public interface PermissionCheckService {
    void checkPermission(
            HttpServletRequest request,
            Method method,
            PermissionAnnotation methodAnnotation,
            PermissionAnnotation classAnnotation
    ) throws BusinessException;
}