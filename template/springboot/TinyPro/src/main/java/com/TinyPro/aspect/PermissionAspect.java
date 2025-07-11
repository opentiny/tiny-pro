package com.TinyPro.aspect;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.entity.po.User;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

@Aspect
@Component
public class PermissionAspect {
//    @Autowired
//    private UserService userService;
    @Before("@annotation(com.TinyPro.annotation.PermissionAnnotation)")
    public void checkPermission(JoinPoint joinPoint) {
        // 获取当前HTTP请求
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        // 获取方法和类上的权限注解
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        PermissionAnnotation methodPermission = method.getAnnotation(PermissionAnnotation.class);
        PermissionAnnotation classPermission = joinPoint.getTarget().getClass().getAnnotation(PermissionAnnotation.class);

        // 合并权限要求（方法注解优先）
        List<String> requiredPermissions = getPermissionAnnotation(methodPermission, classPermission);

        // 如果没有权限要求，直接放行
        if (requiredPermissions.isEmpty()) {
            return;
        }

        // 获取当前认证用户
        //TODO 使用redis获取用户信息
//        User user = (User) authentication.getPrincipal();

        // 从请求头获取Token
        String authHeader = request.getHeader("Authorization");
        String token = extractToken(authHeader);

        // TODO 获取用户权限列表
//        List<String> userPermissions = userService.getUserPermissions(token, user);

        // 检查权限
//        if (!hasPermission(userPermissions, requiredPermissions)) {
//            throw new RuntimeException("Permission denied");
//        }
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }

    private List<String> getPermissionAnnotation(PermissionAnnotation methodPerm,
                                                PermissionAnnotation classPerm) {
        if (methodPerm != null) {
            return Arrays.asList(methodPerm.value());
        } else if (classPerm != null) {
            return Arrays.asList(classPerm.value());
        }
        return List.of();
    }

    private boolean hasPermission(List<String> userPermissions, List<String> requiredPermissions) {
        // 超级管理员权限
        if (userPermissions.contains("*")) {
            return true;
        }
        return userPermissions.containsAll(requiredPermissions);
    }
}
