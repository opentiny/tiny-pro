package com.TinyPro.controller;

import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.dto.PaginationQueryDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.vo.ApplicationVo;
import com.TinyPro.entity.vo.I18Vo;
import com.TinyPro.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/application")
@Tag(name = "应用管理", description = "应用相关接口")
public class ApplicationController {
  @Autowired
  private ApplicationService applicationService;

  @Operation(summary = "获取应用列表", description = "分页查询应用，支持关键词搜索和分类过滤")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "成功",
      content = @Content(schema = @Schema(implementation = ApplicationVo.class)))
  })
  @GetMapping
  public ResponseEntity<ApplicationVo> getAllApplication(
      @Valid @RequestBody PaginationQueryDto searchInfo) {
    return new ResponseEntity<>(applicationService.findAllApplication(searchInfo), HttpStatus.OK);
  }

  @Operation(summary = "创建应用", description = "创建新应用，支持初始化模式（已存在则返回）")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "创建成功"),
    @ApiResponse(responseCode = "400", description = "应用已存在")
  })
  @PostMapping
  public Application createApplication(@Valid @RequestBody CreateApplicationDto dto,
                                       @RequestParam(defaultValue = "false") boolean isInit) {
    return applicationService.createApplication(dto, isInit);
  }
}
