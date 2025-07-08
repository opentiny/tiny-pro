package com.TinyPro.aspect;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.enums.ResponseCodeEnum;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;



@Aspect
@Component
public class IsPublicAspect {
//    private static final Logger logger = LoggerFactory.getLogger(AuthAspect.class);

//    @Value("${jwt.secret}")
//    private String jwtSecret;



    // 切入点：标记了@IsPublic的方法或类，以及未标记的所有方法
    @Before("@annotation(com.TinyPro.annotation.IsPublic)")
    public void authenticate(JoinPoint joinPoint) {
        // 检查是否为公开路由
        if (isPublicRoute(joinPoint)) {
            return;
        }

        // 获取请求对象
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        // 提取Token
        String token = extractTokenFromHeader(request);
        if (token == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_403);
        }

        try {
           // TODO redis验证获取Token
            User user=new User();
            // 注入用户信息到请求
            request.setAttribute("user", user);

           // TODO验证缓存Token


        } catch (Exception e) {
//            logger.error("JWT 验证失败", e);
//            throw new AuthException("Token 已过期", HttpStatus.UNAUTHORIZED);
        }
    }

    // 检查是否为公开路由
    private boolean isPublicRoute(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        if (signature.getMethod().isAnnotationPresent(IsPublic.class)) {
            return true;
        }
        return joinPoint.getTarget().getClass().isAnnotationPresent(IsPublic.class);
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

