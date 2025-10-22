package com.TinyPro.service.imp;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IPermissionService;
import com.TinyPro.service.IUserService;
import com.TinyPro.service.PermissionCheckService;
import com.TinyPro.utils.JwtUtil;
import com.alibaba.fastjson.JSON;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionCheckServiceImpl implements PermissionCheckService {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private IUserService iUserService;
    @Autowired
    private IPermissionService iPermissionService;

    @Override
    public void checkPermission(
            HttpServletRequest request,
            Method method,
            PermissionAnnotation methodAnnotation,
            PermissionAnnotation classAnnotation
    ) throws BusinessException {

        // 1. 合并权限要求（方法注解优先）
        String requiredPermissions = getPermissionAnnotation(methodAnnotation, classAnnotation);

        // 2. 如果没有权限要求，直接放行
        if (requiredPermissions == null || requiredPermissions.isEmpty()) {
            return;
        }

        // 3. 从请求头获取 Token
        String authHeader = request.getHeader("Authorization");
        String token = extractToken(authHeader);
        if (token == null) {
            throw new BusinessException("exception.common.unauthorized", HttpStatus.UNAUTHORIZED, "Missing or invalid token");
        }

        // 4. 解析 JWT，获取用户 email
        Claims claims = jwtUtil.parseJwt(token);
        String email = claims.get("email", String.class);

        // 5. 从 Redis 获取用户信息
        String key = Contants.UserJwtTop + email + Contants.UserJwtbt;
        String value = redisUtil.getValue(key);
        if (value == null) {
            throw new BusinessException("exception.common.unauthorized", HttpStatus.UNAUTHORIZED, "User not found in session");
        }
        User user = JSON.parseObject(value, User.class);

        // 6. 获取用户权限列表
        List<Permission> permissions = iUserService.getRoleByUserId(user);
        List<String> userPermissionNames = permissions.stream()
                .map(Permission::getName)
                .collect(Collectors.toList());

        // 7. 校验权限：是否包含所需权限 或者 是否是超级管理员
        if (!userPermissionNames.contains(requiredPermissions) &&
                !userPermissionNames.contains(Contants.ADMIN_SUPE_POWER)) {
            throw new BusinessException("exception.common.forbidden", HttpStatus.FORBIDDEN, requiredPermissions);
        }
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }

    private String getPermissionAnnotation(PermissionAnnotation methodAnnotation,
                                           PermissionAnnotation classAnnotation) {
        if (methodAnnotation != null) {
            return methodAnnotation.value();
        } else if (classAnnotation != null) {
            return classAnnotation.value();
        }
        return null;
    }
}