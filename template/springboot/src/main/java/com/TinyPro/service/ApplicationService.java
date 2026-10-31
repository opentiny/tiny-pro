package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.dto.ApplicationPaginationQueryDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.vo.ApplicationVo;

public interface ApplicationService {
  /**
   * 分页查询应用列表
   */
  ApplicationVo findAllApplication(ApplicationPaginationQueryDto searchInfo);

  /**
   * 创建应用
   * @param dto 应用信息
   * @return 已存在或新建的应用实体
   */
  Application createApplication(CreateApplicationDto dto);
}
