package com.TinyPro.aspect;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.enums.ResponseCodeEnum;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.utils.JwtUtil;
import com.TinyPro.utils.LocaleUntil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Locale;

@Aspect
@Component
public class UserGuards {
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private JwtUtil jwtUtil;
    @Pointcut("@annotation(com.TinyPro.annotation.AuthGuard)")
    public void CheckPoint() {}

    @Around("CheckPoint()")
    public Object beforeAdvice(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取当前请求的 HttpServletRequest
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        if (method.isAnnotationPresent(IsPublic.class)){
            return joinPoint.proceed();
        }
        String token = extractTokenFromHeader(request);
        if (StringUtils.isEmpty(token)){
            //TODO 返回类型的潘顿，AUthor的判断
            throw new BusinessException( ResponseCodeEnum.CODE_404,messageSource.getMessage("exception.common.tokenError",null, LocaleUntil.getLocale()));
        }
        Claims claims = jwtUtil.parseJwt(token);
        String email = claims.get("email").toString();
        String jwt = redisUtil.getValue(Contants.UserJwtTop + email + Contants.UserJwtbt);
        if (!StringUtils.equals(jwt,token)){
            throw new BusinessException( ResponseCodeEnum.CODE_404,messageSource.getMessage("exception.common.tokenError",null, LocaleUntil.getLocale()));
        }
        return joinPoint.proceed();

    }
    private String extractTokenFromHeader(HttpServletRequest request){
        // 获取 Authorization 头
        String authHeader = request.getHeader("Authorization");

        // 检查是否包含 "Bearer" 并解析 Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // 分割字符串并提取 Token
            String[] parts = authHeader.split(" ", 2);
            if (parts.length == 2 && "Bearer".equalsIgnoreCase(parts[0])) {
                return parts[1];
            }
        }

        // 如果格式不正确或没有找到，返回 null
        return null;
    }
}
