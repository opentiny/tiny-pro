package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.dto.PaginationQueryDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.vo.ApplicationVo;

public interface ApplicationService {
  /**
   * 分页查询应用列表
   */
  ApplicationVo findAllApplication(PaginationQueryDto searchInfo);

  /**
   * 创建应用
   * @param dto 应用信息
   * @param isInit 是否初始化模式（true: 已存在则直接返回，不抛异常；false: 已存在则抛异常）
   * @return 已存在或新建的应用实体
   */
  Application createApplication(CreateApplicationDto dto, boolean isInit);
}
