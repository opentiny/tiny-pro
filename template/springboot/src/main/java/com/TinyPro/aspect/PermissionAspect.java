package com.TinyPro.aspect;

import com.TinyPro.annotation.PermissionAnnotation;

import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IUserService;
import com.TinyPro.service.PermissionCheckService;
import com.TinyPro.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


import java.lang.reflect.Method;

@Aspect
@Component
public class PermissionAspect {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private IUserService iUserService;
    @Autowired
    private IPermissionService iPermissionService;
    @Autowired
    private PermissionCheckService permissionCheckService;

    @Around("@annotation(com.TinyPro.annotation.PermissionAnnotation)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取当前HTTP请求
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        // 获取方法和类上的权限注解
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        PermissionAnnotation methodPermission = method.getAnnotation(PermissionAnnotation.class);
        PermissionAnnotation classPermission = joinPoint.getTarget().getClass().getAnnotation(PermissionAnnotation.class);
        permissionCheckService.checkPermission(request, method, methodPermission,classPermission);
        return joinPoint.proceed();

    }
}
