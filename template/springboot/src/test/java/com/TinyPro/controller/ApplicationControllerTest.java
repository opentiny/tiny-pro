package com.TinyPro.controller;

import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.dto.PaginationQueryDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.vo.ApplicationVo;
import com.TinyPro.service.ApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ApplicationControllerTest {

  @Test
  void bindsPageAndLimitQueryParameters() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "2")
        .param("limit", "10"))
      .andExpect(status().isOk());

    assertEquals(2, applicationService.lastSearchInfo.getPage());
    assertEquals(10, applicationService.lastSearchInfo.getLimit());
  }

  private ApplicationController controller(ApplicationService applicationService) {
    ApplicationController controller = new ApplicationController();
    ReflectionTestUtils.setField(controller, "applicationService", applicationService);
    return controller;
  }

  private static final class RecordingApplicationService implements ApplicationService {
    private PaginationQueryDto lastSearchInfo;

    @Override
    public ApplicationVo findAllApplication(PaginationQueryDto searchInfo) {
      this.lastSearchInfo = searchInfo;
      return new ApplicationVo();
    }

    @Override
    public Application createApplication(CreateApplicationDto dto, boolean isInit) {
      throw new UnsupportedOperationException("Not used in this test");
    }
  }
}
