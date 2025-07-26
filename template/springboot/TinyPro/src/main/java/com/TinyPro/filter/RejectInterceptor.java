package com.TinyPro.filter;

import com.TinyPro.annotation.Reject;
import com.TinyPro.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RejectInterceptor implements HandlerInterceptor {

    @Autowired
    private MessageSource messageSource;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        if (!(handler instanceof HandlerMethod)) {
            return true;   // 静态资源放行
        }

        HandlerMethod hm = (HandlerMethod) handler;
        boolean reject = hm.hasMethodAnnotation(Reject.class) ||
                         hm.getBeanType().isAnnotationPresent(Reject.class);

        if (reject) {
            throw new BusinessException("exception.preview.reject-this-request",null);
        }
        return true;
    }
}