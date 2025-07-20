package com.TinyPro.filter;

import com.TinyPro.annotation.Reject;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;

@Component
public class RejectRequestFilter extends OncePerRequestFilter {

    @Autowired
    private MessageSource messageSource;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException, java.io.IOException {

        // 1. 获取当前 handler 方法
        HandlerMethod handler = ((HandlerMethod) RequestContextHolder
                .getRequestAttributes()
                .getAttribute(HandlerMapping.BEST_MATCHING_HANDLER_ATTRIBUTE,
                        RequestAttributes.SCOPE_REQUEST));

        if (handler != null) {
            // 2. 读取方法或类上的 @Reject
            boolean reject = handler.hasMethodAnnotation(Reject.class) ||
                             handler.getBeanType().isAnnotationPresent(Reject.class);

            if (reject) {
                // 3. 国际化提示
                String msg = messageSource.getMessage(
                        "exception.preview.reject-this-request",
                        null,
                        LocaleContextHolder.getLocale());

                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"" + msg + "\"}");
                return;
            }
        }

        // 4. 放行
        filterChain.doFilter(request, response);
    }
}