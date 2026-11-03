package com.TinyPro.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

/**
 * Rejects oversized chat request bodies before Jackson binds them to the DTO.
 */
@Component
public class ChatRequestSizeFilter extends OncePerRequestFilter {

    private static final String CHAT_PATH = "/robot/chat/completions";
    private static final int PAYLOAD_TOO_LARGE = HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE;

    private final long maxRequestBytes;

    public ChatRequestSizeFilter(
            @Value("${tinypro.chat.max-request-bytes:${CHAT_MAX_REQUEST_BYTES:2097152}}") long maxRequestBytes) {
        if (maxRequestBytes <= 0) {
            throw new IllegalArgumentException("Chat request size limit must be positive");
        }
        this.maxRequestBytes = maxRequestBytes;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (!isChatRequest(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (request.getContentLengthLong() > maxRequestBytes) {
            reject(response);
            return;
        }

        try {
            filterChain.doFilter(new LimitedBodyRequest(request, maxRequestBytes), response);
        } catch (RequestTooLargeException exception) {
            if (!response.isCommitted()) {
                reject(response);
            }
        }
    }

    private boolean isChatRequest(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && request.getRequestURI() != null
                && request.getRequestURI().endsWith(CHAT_PATH);
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.sendError(PAYLOAD_TOO_LARGE, "Chat request body is too large");
    }

    private static final class LimitedBodyRequest extends HttpServletRequestWrapper {
        private final long maxBytes;
        private ServletInputStream inputStream;

        private LimitedBodyRequest(HttpServletRequest request, long maxBytes) {
            super(request);
            this.maxBytes = maxBytes;
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            if (inputStream == null) {
                inputStream = new LimitedInputStream(super.getInputStream(), maxBytes);
            }
            return inputStream;
        }

        @Override
        public BufferedReader getReader() throws IOException {
            String encoding = getCharacterEncoding();
            return new BufferedReader(new InputStreamReader(
                    getInputStream(), encoding == null
                            ? StandardCharsets.UTF_8
                            : Charset.forName(encoding)));
        }
    }

    private static final class LimitedInputStream extends ServletInputStream {
        private final ServletInputStream delegate;
        private final long maxBytes;
        private long bytesRead;

        private LimitedInputStream(ServletInputStream delegate, long maxBytes) {
            this.delegate = delegate;
            this.maxBytes = maxBytes;
        }

        @Override
        public int read() throws IOException {
            if (bytesRead >= maxBytes) {
                int extraByte = delegate.read();
                if (extraByte != -1) {
                    throw new RequestTooLargeException();
                }
                return -1;
            }
            int value = delegate.read();
            if (value != -1) {
                bytesRead++;
            }
            return value;
        }

        @Override
        public int read(byte[] bytes, int offset, int length) throws IOException {
            if (length == 0) {
                return 0;
            }
            if (bytesRead >= maxBytes) {
                int extraByte = delegate.read();
                if (extraByte != -1) {
                    throw new RequestTooLargeException();
                }
                return -1;
            }
            int allowed = (int) Math.min(length, maxBytes - bytesRead);
            int read = delegate.read(bytes, offset, allowed);
            if (read > 0) {
                bytesRead += read;
            }
            return read;
        }

        @Override
        public int available() throws IOException {
            return delegate.available();
        }

        @Override
        public void close() throws IOException {
            delegate.close();
        }

        @Override
        public boolean isFinished() {
            return delegate.isFinished();
        }

        @Override
        public boolean isReady() {
            return delegate.isReady();
        }

        @Override
        public void setReadListener(ReadListener readListener) {
            delegate.setReadListener(readListener);
        }
    }

    private static final class RequestTooLargeException extends RuntimeException {
    }
}
