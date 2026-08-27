package com.TinyPro.controller;

import com.TinyPro.entity.dto.PaginationQueryDto;
import com.TinyPro.entity.vo.ApplicationVo;
import com.TinyPro.service.ApplicationService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ApplicationControllerTest {

  @Test
  void bindsPageAndLimitQueryParameters() throws Exception {
    ApplicationService applicationService = mock(ApplicationService.class);
    when(applicationService.findAllApplication(any(PaginationQueryDto.class)))
      .thenReturn(new ApplicationVo());

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"page\":2,\"limit\":10}"))
      .andExpect(status().isOk());

    ArgumentCaptor<PaginationQueryDto> captor = ArgumentCaptor.forClass(PaginationQueryDto.class);
    verify(applicationService).findAllApplication(captor.capture());
    assertEquals(2, captor.getValue().getPage());
    assertEquals(10, captor.getValue().getLimit());
  }

  private ApplicationController controller(ApplicationService applicationService) {
    ApplicationController controller = new ApplicationController();
    ReflectionTestUtils.setField(controller, "applicationService", applicationService);
    return controller;
  }
}
