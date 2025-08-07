package com.TinyPro.filter;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.utils.JwtUtil;
import com.alibaba.fastjson.JSON;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class UserGuardsFilter implements HandlerInterceptor {

    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        try {
            // 1. 只处理方法级别的 handler
            if (!(handler instanceof HandlerMethod)) {
                return true; // 静态资源直接放行
            }

            HandlerMethod handlerMethod = (HandlerMethod) handler;

            // 2. 如果有 @IsPublic 直接放行
            boolean isPublic = handlerMethod.hasMethodAnnotation(IsPublic.class) ||
                    handlerMethod.getBeanType().isAnnotationPresent(IsPublic.class);
            if (isPublic) {
                return true;
            }

            // 3. 校验 token
            String token = extractTokenFromHeader(request);
            if (token == null) {
                throw new BusinessException("exception.common.tokenExpire", HttpStatus.NOT_FOUND, null);
            }

            Claims claims = jwtUtil.parseJwt(token);
            String email = claims.get("email", String.class);
            String key = Contants.UserJwtTop + email + Contants.UserJwtbt;
            String cached = redisUtil.getValue(key);
            if (StringUtils.isBlank(cached)) {
                response.sendRedirect("/vue-pro/login");
                return false;
            }
            User user = JSON.parseObject(cached, User.class);

            if (StringUtils.isBlank(cached) || !user.getEmail().equals(email)) {
                throw new BusinessException("exception.common.tokenError", HttpStatus.NOT_FOUND, null);
            }
            return true;
        } catch (Exception e) {
            throw new BusinessException("exception.common.tokenError", HttpStatus.NOT_FOUND, null);
        }
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer "))
                ? header.substring(7)
                : null;
    }
}