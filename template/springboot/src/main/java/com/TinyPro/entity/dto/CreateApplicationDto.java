package com.TinyPro.entity.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "创建应用请求")
public class CreateApplicationDto {
  @NotBlank
  @Schema(description = "应用名称", required = true)
  private String name;

  @Schema(description = "描述")
  private String description;

  @Schema(description = "标签数组或 JSON 字符串")
  private JsonNode tag;

  @Schema(description = "图标")
  private String icon;

  @Schema(description = "分类")
  private String classify;
}
