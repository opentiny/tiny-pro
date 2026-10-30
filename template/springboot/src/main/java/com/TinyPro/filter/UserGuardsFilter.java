package com.TinyPro.filter;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.vo.AuthenticatedPrincipal;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class UserGuardsFilter implements HandlerInterceptor {

    @Autowired
    private TokenService tokenService;

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
                throw new BusinessException("exception.common.tokenError", HttpStatus.UNAUTHORIZED, null);
            }

            AuthenticatedPrincipal principal = tokenService.authenticate(token);
            request.setAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE, principal);
            return true;
        } catch (BusinessException businessException) {
            // Preserve the specific token error and HTTP status for the client.
            throw businessException;
        } catch (Exception e) {
            throw new BusinessException("exception.common.tokenError", HttpStatus.UNAUTHORIZED, null);
        }
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer "))
                ? header.substring(7)
                : null;
    }
}
