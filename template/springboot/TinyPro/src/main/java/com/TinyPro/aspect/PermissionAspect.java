package com.TinyPro.aspect;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.enums.ResponseCodeEnum;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;

import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IUserService;
import com.TinyPro.utils.JwtUtil;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import io.jsonwebtoken.Claims;
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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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
        // 1.从请求头获取Token
        String authHeader = request.getHeader("Authorization");
        String token = extractToken(authHeader);
        Claims claims = jwtUtil.parseJwt(token);
        String email = claims.get("email", String.class);
        // 2.使用redis获取用户信息
        String key= Contants.UserJwtTop+email+Contants.UserJwtbt;
        String value = redisUtil.getValue(key);
        User user = JSON.parseObject(value, User.class);

        // 获取用户权限列表
        //1.先获取角色ID和信息
        List<Integer> permissionIds=iUserService.getRoleByUserId(user);
        // 判空防止 NPE
        if (CollectionUtils.isEmpty(permissionIds)) {
            return ;
        }
        //2.获取当前角色拥有的权限信息
        List<Permission> permissions = iPermissionService
                .list(
                new LambdaQueryWrapper<Permission>()
                        .in(Permission::getId, permissionIds)
                    );
        List<String> permission = permissions.stream().map(item -> {
            String name = item.getName();
            return name;
        }).collect(Collectors.toList());

        // 3.检查接口需要的权限，和角色的权限是否一致
        if (!hasPermission(permission, requiredPermissions)) {
            throw new RuntimeException("Permission denied");
        }
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
    // 从请求头提取Token
    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}
