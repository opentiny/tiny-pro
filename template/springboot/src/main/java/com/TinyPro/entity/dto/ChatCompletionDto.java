package com.TinyPro.entity.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

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

    @Schema(description = "模型名称，缺省时使用服务端配置的 tinypro.llm.model", example = "qwen-plus")
    private String model;

    @Schema(description = "对话消息列表")
    @NotEmpty(message = "messages 不能为空")
    @Size(max = 200, message = "messages 最多 200 条")
    @Valid
    private List<ChatMessage> messages;

    /**
     * 请求体中未显式声明的其他参数，原样透传给上游。
     */
    @JsonIgnore
    private Map<String, Object> extraParams = new LinkedHashMap<>();

    @JsonAnySetter
    void setExtraParam(String key, Object value) {
        extraParams.put(key, value);
    }

    @Data
    @Schema(description = "对话消息")
    public static class ChatMessage {

        @Schema(description = "角色：system / user / assistant", example = "user")
        @NotBlank(message = "message.role 不能为空")
        private String role;

        @Schema(description = "消息内容")
        @NotBlank(message = "message.content 不能为空")
        @Size(max = 100000, message = "message.content 最长 100000 字符")
        private String content;
    }
}
