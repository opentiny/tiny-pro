package com.TinyPro.controller;

import com.TinyPro.entity.dto.ApplicationPaginationQueryDto;
import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.vo.ApplicationVo;
import com.TinyPro.service.ApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

  @Test
  void passesApplicationFiltersAndReturnsSearchResult() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    applicationService.applicationSearchResult = new ApplicationVo(
      java.util.List.of(new ApplicationVo.ApplicationItem(
        1L, "TinyVue", "UI component library", java.util.List.of("dev"), "icon.png", "dev"
      )),
      1
    );

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "2")
        .param("limit", "10")
        .param("classify", "dev")
        .param("keywords", "TinyVue"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.total").value(1))
      .andExpect(jsonPath("$.data[0].name").value("TinyVue"));

    assertEquals("dev", applicationService.lastSearchInfo.getClassify());
    assertEquals("TinyVue", applicationService.lastSearchInfo.getKeywords());
  }

  @Test
  void usesDefaultPaginationValuesWhenQueryParametersAreOmitted() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application"))
      .andExpect(status().isOk());

    assertEquals(1, applicationService.lastSearchInfo.getPage());
    assertEquals(1, applicationService.lastSearchInfo.getLimit());
    assertNull(applicationService.lastSearchInfo.getClassify());
    assertNull(applicationService.lastSearchInfo.getKeywords());
  }

  @Test
  void rejectsQueryWhenPageIsLessThanOne() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "0")
        .param("limit", "10"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastSearchInfo);
  }

  @Test
  void rejectsQueryWhenLimitExceedsMaximum() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "101"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastSearchInfo);
  }

  @Test
  void acceptsMaximumPageSize() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "3")
        .param("limit", "100"))
      .andExpect(status().isOk());

    assertEquals(3, applicationService.lastSearchInfo.getPage());
    assertEquals(100, applicationService.lastSearchInfo.getLimit());
  }

  @Test
  void rejectsQueryWhenLimitIsZero() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "0"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastSearchInfo);
  }

  @Test
  void rejectsQueryWhenPageIsNotNumeric() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "first")
        .param("limit", "10"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastSearchInfo);
  }

  @Test
  void rejectsQueryWhenLimitIsNotNumeric() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "many"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastSearchInfo);
  }

  @Test
  void forwardsClassifyFilterWithoutKeywords() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "20")
        .param("classify", "design"))
      .andExpect(status().isOk());

    assertEquals("design", applicationService.lastSearchInfo.getClassify());
    assertNull(applicationService.lastSearchInfo.getKeywords());
  }

  @Test
  void forwardsKeywordsFilterWithoutClassify() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "20")
        .param("keywords", "engine"))
      .andExpect(status().isOk());

    assertNull(applicationService.lastSearchInfo.getClassify());
    assertEquals("engine", applicationService.lastSearchInfo.getKeywords());
  }

  @Test
  void returnsEmptyApplicationSearchResult() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    applicationService.applicationSearchResult = new ApplicationVo(java.util.List.of(), 0);
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "10"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.total").value(0))
      .andExpect(jsonPath("$.data").isEmpty());
  }

  @Test
  void returnsAllApplicationFieldsInSearchResult() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    applicationService.applicationSearchResult = new ApplicationVo(
      java.util.List.of(new ApplicationVo.ApplicationItem(
        9L,
        "TinyEditor",
        "Rich text editor",
        java.util.Map.of("type", "success"),
        "editor.png",
        "dev"
      )),
      9
    );
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(get("/application")
        .param("page", "1")
        .param("limit", "10"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.total").value(9))
      .andExpect(jsonPath("$.data[0].id").value(9))
      .andExpect(jsonPath("$.data[0].name").value("TinyEditor"))
      .andExpect(jsonPath("$.data[0].description").value("Rich text editor"))
      .andExpect(jsonPath("$.data[0].icon").value("editor.png"))
      .andExpect(jsonPath("$.data[0].classify").value("dev"));
  }

  @Test
  void createsApplicationWithoutInitParameter() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    Application created = new Application(
      "TinyVue",
      "UI component library",
      "[{\"type\":\"success\",\"value\":\"dev\"}]",
      "icon.png",
      "dev"
    );
    created.setId(1L);
    applicationService.createdApplication = created;

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(post("/application")
        .contentType(APPLICATION_JSON)
        .content("""
          {
            "name": "TinyVue",
            "description": "UI component library",
            "tag": [{"type": "success", "value": "dev"}],
            "icon": "icon.png",
            "classify": "dev"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.id").value(1))
      .andExpect(jsonPath("$.name").value("TinyVue"));

    assertEquals("TinyVue", applicationService.lastCreateRequest.getName());
    assertEquals("dev", applicationService.lastCreateRequest.getClassify());
  }

  @Test
  void rejectsApplicationWithoutName() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(post("/application")
        .contentType(APPLICATION_JSON)
        .content("{\"description\":\"missing name\"}"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastCreateRequest);
  }

  @Test
  void forwardsAllCreateApplicationFields() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    Application created = new Application(
      "TinyCharts",
      "Chart library",
      "[{\"type\":\"success\"}]",
      "charts.png",
      "dev"
    );
    created.setId(3L);
    applicationService.createdApplication = created;
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(post("/application")
        .contentType(APPLICATION_JSON)
        .content("""
          {
            "name": "TinyCharts",
            "description": "Chart library",
            "tag": [{"type": "success"}],
            "icon": "charts.png",
            "classify": "dev"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.id").value(3))
      .andExpect(jsonPath("$.description").value("Chart library"))
      .andExpect(jsonPath("$.icon").value("charts.png"))
      .andExpect(jsonPath("$.classify").value("dev"));

    assertEquals("TinyCharts", applicationService.lastCreateRequest.getName());
    assertEquals("Chart library", applicationService.lastCreateRequest.getDescription());
    assertTrue(applicationService.lastCreateRequest.getTag().isArray());
    assertEquals("charts.png", applicationService.lastCreateRequest.getIcon());
    assertEquals("dev", applicationService.lastCreateRequest.getClassify());
  }

  @Test
  void rejectsApplicationWithBlankName() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(post("/application")
        .contentType(APPLICATION_JSON)
        .content("{\"name\":\"   \"}"))
      .andExpect(status().isBadRequest());

    assertNull(applicationService.lastCreateRequest);
  }

  @Test
  void rejectsCreateRequestWithUnsupportedMediaType() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(post("/application")
        .contentType("text/plain")
        .content("TinyVue"))
      .andExpect(status().isUnsupportedMediaType());

    assertNull(applicationService.lastCreateRequest);
  }

  @Test
  void createsApplicationWithOnlyRequiredName() throws Exception {
    RecordingApplicationService applicationService = new RecordingApplicationService();
    Application created = new Application();
    created.setId(2L);
    created.setName("TinyEngine");
    applicationService.createdApplication = created;

    MockMvc mockMvc = MockMvcBuilders
      .standaloneSetup(controller(applicationService))
      .build();

    mockMvc.perform(post("/application")
        .contentType(APPLICATION_JSON)
        .content("{\"name\":\"TinyEngine\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.id").value(2))
      .andExpect(jsonPath("$.name").value("TinyEngine"));

    assertEquals("TinyEngine", applicationService.lastCreateRequest.getName());
    assertNull(applicationService.lastCreateRequest.getDescription());
  }



  private ApplicationController controller(ApplicationService applicationService) {
    ApplicationController controller = new ApplicationController();
    ReflectionTestUtils.setField(controller, "applicationService", applicationService);
    return controller;
  }

  private static final class RecordingApplicationService implements ApplicationService {
    private ApplicationPaginationQueryDto lastSearchInfo;
    private ApplicationVo applicationSearchResult = new ApplicationVo();
    private CreateApplicationDto lastCreateRequest;
    private Application createdApplication;

    @Override
    public ApplicationVo findAllApplication(ApplicationPaginationQueryDto searchInfo) {
      this.lastSearchInfo = searchInfo;
      return applicationSearchResult;
    }

    @Override
    public Application createApplication(CreateApplicationDto dto) {
      this.lastCreateRequest = dto;
      return createdApplication;
    }
  }
}
