package com.TinyPro.filter;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.enums.ResponseCodeEnum;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;

public class AuthFilter implements Filter {
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private JwtUtil jwtUtil;
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 1. 获取当前 handler 方法
        HandlerMethod handler = ((HandlerMethod) RequestContextHolder
                .getRequestAttributes()
                .getAttribute(HandlerMapping.BEST_MATCHING_HANDLER_ATTRIBUTE,
                        RequestAttributes.SCOPE_REQUEST));
        if (ObjectUtils.isNotEmpty(handler)){
            boolean ispublic = handler.hasMethodAnnotation(IsPublic.class) ||
                    handler.getBeanType().isAnnotationPresent(IsPublic.class);
            if (ObjectUtils.isNotEmpty(ispublic)) {
                filterChain.doFilter(servletRequest,servletResponse);
            }else {
                // 获取请求对象
                HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

                // 提取Token
                String token = extractTokenFromHeader(request);
                if (token == null) {
                    throw new BusinessException(ResponseCodeEnum.CODE_403);
                }
                try {
                    Claims claims = jwtUtil.parseJwt(token);
                    String email = claims.get("email", String.class); // 你当初放进去的字段
                    if (StringUtils.isBlank(email)) {
                        throw new RuntimeException("非法 token");
                    }
                    String key= Contants.UserJwtTop+email+Contants.UserJwtbt;
                    String jwt = redisUtil.getValue(key);
                    //如果为空或者和前端的token不一样，就报错
                    if (StringUtils.isBlank(jwt)||!StringUtils.equals(jwt,token)){
                        throw new RuntimeException("token不对");
                    }
                    filterChain.doFilter(servletRequest,servletResponse);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }

        }
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
