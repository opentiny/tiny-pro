package com.TinyPro.controller;

import com.TinyPro.entity.po.Employee;
import com.TinyPro.entity.vo.EmployeePageVo;
import com.TinyPro.exception.GlobalExceptionHandler;
import com.TinyPro.service.IEmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

class EmployeesControllerTest {

    private MockMvc mockMvc;
    private IEmployeeService employeeService;

    @BeforeEach
    void setUp() {
        employeeService = mock(IEmployeeService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new EmployeesController(employeeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getEmployeeUsesTheRealServiceContract() throws Exception {
        when(employeeService.queryPage(any()))
                .thenReturn(new EmployeePageVo(60, List.of(), Map.of("createTime", Map.of("min", "", "max", ""))));

        mockMvc.perform(post("/employee/getEmployee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pageIndex\":1,\"pageSize\":10,\"searchInfo\":{\"keyword\":\"\",\"filters\":[]}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.total").value(60))
                .andExpect(jsonPath("$.data.data.length()").value(0));

        verify(employeeService).queryPage(any());
    }

    @Test
    void getEmployeeRejectsGetRequests() throws Exception {
        mockMvc.perform(get("/employee/getEmployee"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", "POST"));
    }

    @Test
    void getEmployeeInfoReturnsTheRequestedEmployee() throws Exception {
        Employee employee = new Employee();
        employee.setId(2L);
        employee.setName("员工2");
        employee.setEmployeeNo("00000002");
        when(employeeService.getById("2")).thenReturn(employee);

        mockMvc.perform(post("/employee/getEmployeeInfo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.id").value("2"))
                .andExpect(jsonPath("$.data.name").value("员工2"))
                .andExpect(jsonPath("$.data.employeeNo").value("00000002"));
    }

    @Test
    void createEmployeeReturnsTheCreatedEmployee() throws Exception {
        Employee employee = new Employee();
        employee.setId(61L);
        employee.setName("新员工");
        employee.setEmployeeNo("00000061");
        when(employeeService.create(any())).thenReturn(employee);

        mockMvc.perform(post("/employee/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"新员工\",\"employeeNo\":\"00000061\",\"status\":\"1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data.id").value("61"))
                .andExpect(jsonPath("$.data.name").value("新员工"))
                .andExpect(jsonPath("$.data.employeeNo").value("00000061"));

        verify(employeeService).create(any());
    }

    @Test
    void getEmployeeInfoRejectsGetRequests() throws Exception {
        mockMvc.perform(get("/employee/getEmployeeInfo").param("id", "2"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", "POST"));
    }

    @Test
    void updateEmployeeUsesTheNestCompatibleDataEnvelope() throws Exception {
        when(employeeService.update(any())).thenReturn(true);

        mockMvc.perform(post("/employee/updateEmployeeInfo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"data\":{\"id\":\"2\",\"name\":\"新名称\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.data").value(true));

        verify(employeeService).update(any());
    }

    @Test
    void deleteEmployeeUsesTheNestCompatibleResponseEnvelope() throws Exception {
        when(employeeService.remove("2")).thenReturn(true);

        mockMvc.perform(delete("/employee/delete").param("id", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0"))
                .andExpect(jsonPath("$.errMsg").value(""))
                .andExpect(jsonPath("$.data").value(true));

        verify(employeeService).remove(eq("2"));
    }
}
