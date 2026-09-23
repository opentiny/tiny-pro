package com.TinyPro.entity.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "应用分页响应")
public class ApplicationVo {
  @Schema(description = "应用列表")
  private List<ApplicationItem> data;

  @Schema(description = "总记录数")
  private long total;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Schema(description = "应用条目")
  public static class ApplicationItem {
    private Long id;
    private String name;
    private String description;
    private Object tag;
    private String icon;
    private String classify;
  }
}
