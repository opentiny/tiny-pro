package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.ChatCompletionDto;
import com.TinyPro.service.IChatService;
import com.alibaba.fastjson2.JSON;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 对话补全服务实现，与 NestJS 模板的 ChatService.proxyChatCompletions 逻辑一致：
 *
 * <ul>
 *   <li>使用服务端保存的 LLM_API_KEY 调用 OpenAI 兼容接口（默认通义千问）</li>
 *   <li>LLM_EXTRA_BODY 中的厂商扩展参数与请求体合并（环境变量优先级最高）</li>
 *   <li>上游 SSE 流原样透传给前端</li>
 *   <li>客户端断开时立即中止上游请求，避免大模型继续生成计费</li>
 * </ul>
 *
 * <p>在 NestJS 版本基础上补齐的细节：</p>
 * <ul>
 *   <li>请求体 DTO 校验（messages 非空、单条内容长度上限等），畸形请求不再原样转发给上游</li>
 *   <li>日志不记录用户提问内容，只记录模型名与消息条数，避免隐私泄露</li>
 *   <li>单用户滑动窗口限流（默认 20 次/分钟，可用 LLM_RATE_LIMIT_PER_MINUTE 调整）</li>
 * </ul>
 */
@Service
public class ChatServiceImpl implements IChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final String baseUrl;
    private final String apiKey;
    private final String defaultModel;
    private final String extraBodyJson;
    private final int rateLimitPerMinute;
    private final HttpClient httpClient;

    /** 每个用户的请求时间戳滑动窗口，用于单用户限流。 */
    private final ConcurrentHashMap<String, Deque<Long>> requestWindows = new ConcurrentHashMap<>();

    public ChatServiceImpl(
            @Value("${tinypro.llm.base-url:${LLM_BASE_URL:https://dashscope.aliyuncs.com/compatible-mode/v1}}") String baseUrl,
            @Value("${tinypro.llm.api-key:${LLM_API_KEY:}}") String apiKey,
            @Value("${tinypro.llm.model:${LLM_MODEL:qwen-plus}}") String defaultModel,
            @Value("${tinypro.llm.extra-body:${LLM_EXTRA_BODY:}}") String extraBodyJson,
            @Value("${tinypro.llm.rate-limit-per-minute:${LLM_RATE_LIMIT_PER_MINUTE:20}}") int rateLimitPerMinute) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.extraBodyJson = extraBodyJson;
        this.rateLimitPerMinute = rateLimitPerMinute;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    @Override
    public void proxyChatCompletions(ChatCompletionDto dto,
                                     HttpServletRequest request,
                                     HttpServletResponse response,
                                     String userEmail) {
        checkRateLimit(userEmail);

        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "服务端未配置 LLM_API_KEY，请在环境变量中配置后重启服务");
        }

        Map<String, Object> extraBody = parseExtraBody();

        // 请求体组装顺序与 NestJS 一致：{...前端参数, model, ...环境变量扩展参数}
        Map<String, Object> upstreamBody = new LinkedHashMap<>(dto.getExtraParams());
        upstreamBody.put("messages", dto.getMessages());
        upstreamBody.put("model", dto.getModel() != null && !dto.getModel().isBlank()
                ? dto.getModel() : defaultModel);
        upstreamBody.putAll(extraBody);

        HttpResponse<InputStream> upstream = sendUpstream(upstreamBody);

        if (upstream.statusCode() < 200 || upstream.statusCode() >= 300 || upstream.body() == null) {
            String detail = readErrorBody(upstream);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    detail == null || detail.isBlank() ? "大模型服务请求失败" : detail);
        }

        // 客户端断开时由容器关闭输出流；这里对上游 InputStream 使用 try-with-resources，
        // 响应中断（IOException）时关闭流即中止上游连接，大模型停止继续生成。
        response.setStatus(upstream.statusCode());
        response.setContentType(upstream.headers()
                .firstValue("content-type").orElse("text/event-stream"));
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("X-Accel-Buffering", "no");

        try (InputStream upstreamStream = upstream.body();
             OutputStream out = response.getOutputStream()) {
            upstreamStream.transferTo(out);
            out.flush();
        } catch (IOException ioException) {
            // 响应已开始，客户端断开或连接异常，无法也不再需要返回错误
            logger.warn("对话请求已中断: user={} {}", userEmail, ioException.getMessage());
        }
    }

    private HttpResponse<InputStream> sendUpstream(Map<String, Object> upstreamBody) {
        HttpRequest httpRequest;
        try {
            httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofMinutes(5))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(
                            JSON.toJSONString(upstreamBody), StandardCharsets.UTF_8))
                    .build();
        } catch (Exception e) {
            logger.error("构造大模型请求失败: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "大模型服务连接失败，请检查 LLM_BASE_URL 与服务网络");
        }

        try {
            return httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofInputStream());
        } catch (IOException e) {
            logger.error("调用大模型服务失败: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "大模型服务连接失败，请检查 LLM_BASE_URL 与服务网络");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "大模型服务请求被中断");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseExtraBody() {
        if (extraBodyJson == null || extraBodyJson.isBlank()) {
            return Map.of();
        }
        try {
            Map<String, Object> parsed = JSON.parseObject(extraBodyJson, Map.class);
            return parsed == null ? Map.of() : parsed;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "LLM_EXTRA_BODY 不是合法的 JSON 字符串");
        }
    }

    private String readErrorBody(HttpResponse<InputStream> upstream) {
        try (InputStream body = upstream.body()) {
            return new String(body.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "";
        }
    }

    private void checkRateLimit(String userEmail) {
        if (rateLimitPerMinute <= 0) {
            return; // <=0 表示不限制
        }
        long now = System.currentTimeMillis();
        long windowStart = now - Duration.ofMinutes(1).toMillis();
        Deque<Long> window = requestWindows.computeIfAbsent(userEmail, k -> new ArrayDeque<>());
        synchronized (window) {
            while (!window.isEmpty() && window.peekFirst() < windowStart) {
                window.pollFirst();
            }
            if (window.size() >= rateLimitPerMinute) {
                logger.warn("用户对话请求触发限流: user={} limit={}/min", userEmail, rateLimitPerMinute);
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "对话请求过于频繁，请稍后再试");
            }
            window.addLast(now);
        }
        // 清理已无请求记录的用户，防止 map 无限膨胀
        if (requestWindows.size() > 1024) {
            requestWindows.entrySet().removeIf(entry -> entry.getValue().isEmpty());
        }
    }

    // Java 17 的 HttpClient 没有 close() 方法（Java 21 起才支持 AutoCloseable），
    // 其内部连接池由 JVM 统一回收，这里不做显式关闭。
}
