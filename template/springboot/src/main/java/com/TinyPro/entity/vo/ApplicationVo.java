package com.TinyPro.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationVo {
  private List<ApplicationItem> data;

  private long total;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ApplicationItem {
    private Long id;
    private String name;
    private String description;
    private Object tag;
    private String icon;
    private String classify;
  }
}
