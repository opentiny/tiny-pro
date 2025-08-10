package com.TinyPro.aspect;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;

import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IUserService;
import com.TinyPro.utils.JwtUtil;
import com.alibaba.fastjson.JSON;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


import java.lang.reflect.Method;
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

  @Around("@annotation(com.TinyPro.annotation.PermissionAnnotation)")
  public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
    // 获取当前HTTP请求
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

    // 获取方法和类上的权限注解
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    Method method = signature.getMethod();

    PermissionAnnotation methodPermission = method.getAnnotation(PermissionAnnotation.class);
    PermissionAnnotation classPermission = joinPoint.getTarget().getClass().getAnnotation(PermissionAnnotation.class);

    // 合并权限要求（方法注解优先）
    String requiredPermissions = getPermissionAnnotation(methodPermission, classPermission);

    // 如果没有权限要求，直接放行
    if (requiredPermissions.isEmpty()) {
      return null;
    }
    // 获取当前认证用户
    // 1.从请求头获取Token
    String authHeader = request.getHeader("Authorization");
    String token = extractToken(authHeader);
    Claims claims = jwtUtil.parseJwt(token);
    String email = claims.get("email", String.class);
    // 2.使用redis获取用户信息
    String key = Contants.UserJwtTop + email + Contants.UserJwtbt;
    String value = redisUtil.getValue(key);
    User user = JSON.parseObject(value, User.class);
    // 获取用户权限列表
    //1.先获取角色ID和信息
    List<Permission> permissions = iUserService.getRoleByUserId(user);
    List<String> permission = permissions.stream().map(item -> {
      String name = item.getName();
      return name;
    }).collect(Collectors.toList());

    // 2.检查接口需要的权限，和角色的权限是否一致
    if (!permission.contains(requiredPermissions) && !permission.contains(Contants.ADMIN_SUPE_POWER)) {
      throw new BusinessException("exception.common.forbidden", HttpStatus.FORBIDDEN, requiredPermissions);
    }
    return joinPoint.proceed();

  }

  private String extractToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }

  private String getPermissionAnnotation(PermissionAnnotation methodPerm,
                                         PermissionAnnotation classPerm) {
    if (methodPerm != null) {
      return methodPerm.value();
    } else if (classPerm != null) {
      return classPerm.value();
    } else {
      return null;
    }
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
