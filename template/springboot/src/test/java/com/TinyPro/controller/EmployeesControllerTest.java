package com.TinyPro.controller;

import com.TinyPro.mock.MockListController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EmployeesControllerTest {

    private MockMvc mockMvc;
    private MockListController mockListController;

    @BeforeEach
    void setUp() {
        mockListController = new MockListController();
        mockMvc = MockMvcBuilders.standaloneSetup(new EmployeesController(mockListController)).build();
    }

    @Test
    @Order(1)
    void getEmployeeAcceptsSearchTableQuery() throws Exception {
        mockMvc.perform(post("/employee/getEmployee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pageIndex\":1,\"pageSize\":10,\"searchInfo\":{\"keyword\":\"\",\"filters\":[]}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.total").value(60))
                .andExpect(jsonPath("$.data.data.length()").value(10));
    }

    @Test
    @Order(1)
    void getEmployeeSupportsOpeningTheUrl() throws Exception {
        mockMvc.perform(get("/employee/getEmployee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.total").value(60))
                .andExpect(jsonPath("$.data.data.length()").value(10));
    }

    @Test
    @Order(1)
    void getEmployeeInfoReturnsTheRequestedEmployee() throws Exception {
        mockMvc.perform(post("/employee/getEmployeeInfo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("2"))
                .andExpect(jsonPath("$.name").isNotEmpty())
                .andExpect(jsonPath("$.employeeNo").isNotEmpty());
    }

    @Test
    @Order(2)
    void deleteEmployeeRemovesTheRow() throws Exception {
        mockMvc.perform(delete("/employee/delete").param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.errMsg").value(""))
                .andExpect(jsonPath("$.data").value(true));

        assertTrue(mockListController.getEmployeeInfo(Map.of("id", "1")).isEmpty());
    }
}
