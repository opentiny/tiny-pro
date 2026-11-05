package com.TinyPro.controller;

import com.TinyPro.entity.dto.ChatCompletionDto;
import com.TinyPro.service.IChatService;
import com.TinyPro.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 对话补全接口：转发 OpenAI 兼容的大模型请求（SSE 流式）。
 *
 * <p>LLM_API_KEY 只保存在服务端，前端通过登录态访问本接口
 * （由全局 UserGuardsFilter 完成 JWT 校验）。</p>
 */
@RestController
@RequestMapping("/robot")
@Tag(name = "AI 对话", description = "大模型对话补全代理接口")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private IChatService chatService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 与 NestJS 模板一致转发对话补全请求。
     *
     * <p>日志仅记录模型名与消息条数，不记录用户提问内容，避免隐私泄露。</p>
     */
    @Operation(summary = "对话补全", description = "转发 OpenAI 兼容的大模型对话请求，SSE 流式返回")
    @PostMapping("/chat/completions")
    public void completions(@Valid @RequestBody ChatCompletionDto body,
                            HttpServletRequest request,
                            HttpServletResponse response) {
        String email = resolveUserEmail(request);
        logger.info("收到对话请求: user={} model={} messages={}条",
                email,
                body.getModel() != null ? body.getModel() : "默认",
                body.getMessages() == null ? 0 : body.getMessages().size());
        chatService.proxyChatCompletions(body, request, response, email);
    }

    /**
     * 从 JWT 中解析当前用户标识；解析失败时降级为匿名（正常流程已被登录拦截器保证）。
     */
    private String resolveUserEmail(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtUtil.parseJwt(header.substring(7));
                String email = claims.get("email", String.class);
                if (email != null && !email.isBlank()) {
                    return email;
                }
            } catch (Exception e) {
                logger.debug("解析 JWT 获取用户标识失败: {}", e.getMessage());
            }
        }
        return "anonymous";
    }
}
