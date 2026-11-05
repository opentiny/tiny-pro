package com.TinyPro.service;

import com.TinyPro.entity.dto.ChatCompletionDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 对话补全服务：将前端请求转发到 OpenAI 兼容的大模型服务并透传 SSE 流。
 */
public interface IChatService {

    /**
     * 转发对话补全请求（SSE 流式）。
     *
     * @param dto       前端请求体（已通过 DTO 校验）
     * @param request   当前请求，用于感知客户端断开
     * @param response  响应对象，SSE 流直接写入其中
     * @param userEmail 当前登录用户标识，用于单用户用量限制与日志
     */
    void proxyChatCompletions(ChatCompletionDto dto,
                              HttpServletRequest request,
                              HttpServletResponse response,
                              String userEmail);
}
