package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.ChatCompletionDto;
import com.sun.net.httpserver.HttpServer;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * ChatServiceImpl 单元测试，覆盖与 NestJS 模板 chat.service.spec.ts 相同的场景，
 * 并补充单用户限流与 DTO 转发的验证。
 */
class ChatServiceImplTest {

    private HttpServer stub;
    private final AtomicReference<String> capturedUrl = new AtomicReference<>();
    private final AtomicReference<String> capturedAuth = new AtomicReference<>();
    private final AtomicReference<String> capturedBody = new AtomicReference<>();
    private final AtomicBoolean upstreamClosed = new AtomicBoolean(false);

    @BeforeEach
    void setUp() throws IOException {
        capturedUrl.set(null);
        capturedAuth.set(null);
        capturedBody.set(null);
        upstreamClosed.set(false);
        stub = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    }

    @AfterEach
    void tearDown() {
        if (stub != null) {
            stub.stop(0);
        }
    }

    private String startStub(String mode) {
        stub.createContext("/v1/chat/completions", exchange -> {
            capturedUrl.set(exchange.getRequestURI().getPath());
            capturedAuth.set(exchange.getRequestHeaders().getFirst("Authorization"));
            capturedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            if ("ok".equals(mode)) {
                byte[] sse = (
                        "data: {\"id\":\"stub\",\"choices\":[{\"index\":0,\"delta\":{\"role\":\"assistant\",\"content\":\"ok\"},\"finish_reason\":null}]}\n\n"
                                + "data: [DONE]\n\n").getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
                exchange.sendResponseHeaders(200, sse.length);
                exchange.getResponseBody().write(sse);
                exchange.close();
            } else {
                byte[] err = "{\"error\":{\"message\":\"Invalid API-key\"}}".getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(401, err.length);
                exchange.getResponseBody().write(err);
                exchange.close();
            }
        });
        stub.start();
        return "http://127.0.0.1:" + stub.getAddress().getPort() + "/v1";
    }

    /** 模拟容器断开：写入时抛出 IOException，模拟客户端中断后无法继续写响应。 */
    private HttpServletResponse mockResponse(ByteArrayOutputStream sink, boolean broken) throws IOException {
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getOutputStream()).thenReturn(new ServletOutputStream() {
            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(jakarta.servlet.WriteListener writeListener) {
            }

            @Override
            public void write(int b) throws IOException {
                if (broken) {
                    throw new IOException("Broken pipe");
                }
                sink.write(b);
            }

            @Override
            public void write(byte[] buf, int off, int len) throws IOException {
                if (broken) {
                    throw new IOException("Broken pipe");
                }
                sink.write(buf, off, len);
            }
        });
        return response;
    }

    private HttpServletRequest mockRequest() {
        return mock(HttpServletRequest.class);
    }

    private ChatCompletionDto dto(String content) {
        ChatCompletionDto dto = new ChatCompletionDto();
        dto.setMessages(List.of(Map.of(
                "role", "user",
                "content", content
        )));
        return dto;
    }

    @Test
    void 应带服务端Key转发请求合并ExtraBody并透传SSE流() throws IOException {
        String baseUrl = startStub("ok");
        ChatServiceImpl service = new ChatServiceImpl(baseUrl, "sk-test-key", "qwen-plus",
                "{\"enable_search\":true,\"search_options\":{\"forced_search\":true}}", 0);

        ByteArrayOutputStream sink = new ByteArrayOutputStream();
        service.proxyChatCompletions(dto("你好"), mockRequest(), mockResponse(sink, false), "user@a.com");

        assertEquals("/v1/chat/completions", capturedUrl.get());
        assertEquals("Bearer sk-test-key", capturedAuth.get());
        assertTrue(capturedBody.get().contains("\"model\":\"qwen-plus\""));
        assertTrue(capturedBody.get().contains("\"enable_search\":true"));
        assertTrue(capturedBody.get().contains("\"forced_search\":true"));
        String output = sink.toString(StandardCharsets.UTF_8);
        assertTrue(output.contains("data: [DONE]"));
    }

    @Test
    void 未配置LLMApiKey时应抛出500() {
        ChatServiceImpl service = new ChatServiceImpl(
                "http://127.0.0.1:1/v1", "", "qwen-plus", "", 0);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.proxyChatCompletions(
                        dto("hi"), mockRequest(), mock(HttpServletResponse.class), "user@a.com"));
        assertEquals(500, exception.getStatusCode().value());
    }

    @Test
    void LLMExtraBody非法JSON时应抛出500() {
        ChatServiceImpl service = new ChatServiceImpl(
                "http://127.0.0.1:1/v1", "sk-test-key", "qwen-plus", "{invalid", 0);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.proxyChatCompletions(
                        dto("hi"), mockRequest(), mock(HttpServletResponse.class), "user@a.com"));
        assertEquals(500, exception.getStatusCode().value());
    }

    @Test
    void 上游返回错误时应包装为502并携带上游错误信息() {
        String baseUrl = startStub("unauthorized");
        ChatServiceImpl service = new ChatServiceImpl(baseUrl, "sk-wrong-key", "qwen-plus", "", 0);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.proxyChatCompletions(
                        dto("hi"), mockRequest(), mock(HttpServletResponse.class), "user@a.com"));
        assertEquals(502, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Invalid API-key"));
    }

    @Test
    void 客户端中断时应中止并关闭上游连接() throws IOException {
        // 上游持续输出且感知断开
        stub.createContext("/v1/chat/completions", exchange -> {
            capturedUrl.set(exchange.getRequestURI().getPath());
            exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
            exchange.sendResponseHeaders(200, 0);
            try (OutputStream out = exchange.getResponseBody()) {
                for (int i = 0; i < 100 && !upstreamClosed.get(); i++) {
                    out.write(("data: {\"chunk\":" + i + "}\n\n").getBytes(StandardCharsets.UTF_8));
                    out.flush();
                    Thread.sleep(50);
                }
            } catch (Exception e) {
                upstreamClosed.set(true);
            }
        });
        stub.start();
        String baseUrl = "http://127.0.0.1:" + stub.getAddress().getPort() + "/v1";

        ChatServiceImpl service = new ChatServiceImpl(baseUrl, "sk-test-key", "qwen-plus", "", 0);
        ByteArrayOutputStream sink = new ByteArrayOutputStream();
        List<IOException> writeErrors = new CopyOnWriteArrayList<>();
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getOutputStream()).thenReturn(new ServletOutputStream() {
            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(jakarta.servlet.WriteListener writeListener) {
            }

            @Override
            public void write(int b) throws IOException {
                throw new IOException("client aborted");
            }
        });

        // 客户端已断开，写出会抛 IOException，服务不应向上抛出
        service.proxyChatCompletions(dto("hi"), mockRequest(), response, "user@a.com");

        // 中止后上游应最终感知断开（允许轮询等待）
        for (int i = 0; i < 100 && !upstreamClosed.get(); i++) {
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        assertTrue(upstreamClosed.get());
    }

    @Test
    void 单用户超过限流阈值时应抛出429() throws IOException {
        // 用正常上游保证前两次请求成功到达限流计数，第三次触发 429
        String baseUrl = startStub("ok");
        ChatServiceImpl service = new ChatServiceImpl(baseUrl, "sk-test-key", "qwen-plus", "", 2);
        HttpServletResponse response = mockResponse(new ByteArrayOutputStream(), false);

        HttpServletRequest request = mockRequest();
        service.proxyChatCompletions(dto("1"), request, response, "user@a.com");
        service.proxyChatCompletions(dto("2"), request, response, "user@a.com");
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.proxyChatCompletions(dto("3"), request, response, "user@a.com"));
        assertEquals(429, exception.getStatusCode().value());

        // 其他用户不受影响
        service.proxyChatCompletions(dto("4"), request, response, "other@a.com");
    }
}
