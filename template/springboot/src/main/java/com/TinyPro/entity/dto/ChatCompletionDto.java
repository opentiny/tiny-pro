package com.TinyPro.entity.dto;

import com.alibaba.fastjson2.JSON;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenAI 兼容的对话补全请求体。
 *
 * <p>除以下声明字段外的其他属性（如 temperature、top_p 等）会原样保留在
 * {@link #extraParams} 中并透传给上游大模型服务，与 NestJS 模板行为一致。</p>
 */
@Data
@Schema(description = "对话补全请求（OpenAI 兼容格式）")
public class ChatCompletionDto {

    private static final int MAX_MESSAGES_PAYLOAD_BYTES = 1_000_000;

    @Schema(description = "模型名称，缺省时使用服务端配置的 tinypro.llm.model", example = "qwen-plus")
    private String model;

    @Schema(description = "对话消息列表")
    @NotEmpty(message = "messages 不能为空")
    private List<Map<String, Object>> messages;

    @AssertTrue(message = "messages 请求体过大")
    @JsonIgnore
    public boolean isMessagesPayloadWithinLimit() {
        if (messages == null) {
            return true;
        }
        return JSON.toJSONString(messages).getBytes(StandardCharsets.UTF_8).length
                <= MAX_MESSAGES_PAYLOAD_BYTES;
    }

    /**
     * 请求体中未显式声明的其他参数，原样透传给上游。
     */
    @JsonIgnore
    private Map<String, Object> extraParams = new LinkedHashMap<>();

    @JsonAnySetter
    void setExtraParam(String key, Object value) {
        extraParams.put(key, value);
    }
}
