package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import io.swagger.v3.oas.annotations.Parameter;


import lombok.Getter;
import org.springdoc.core.annotations.ParameterObject;



@Data
@ParameterObject  // 让 Springdoc 展开参数到 Swagger 文档中
public class PaginationQueryDto {

  @Getter
  @Parameter(description = "页数，必须是一个大于零的正整数", example = "1")
  @Min(1)
  private Integer page=1;          // 默认值 1

  @Getter
  @Parameter(description = "页大小，必须是一个正整数，最大 100", example = "10")
  @Min(1)
  @Max(100)
  private Integer limit=1;          // 默认值 1（与 NestJS 原代码一致，也可根据需要改为 10）

  @Parameter(description = "类型")
  private String classify;            // 可选，不加校验

  @Parameter(description = "关键字")
  private String keywords;

  /**
   * Supports clients that use pageIndex/pageSize instead of page/limit.
   */
  public void setPageIndex(Integer pageIndex) {
    if (pageIndex != null) {
      this.page = pageIndex;
    }
  }

  public void setPageSize(Integer pageSize) {
    if (pageSize != null) {
      this.limit = pageSize;
    }
  }



}
