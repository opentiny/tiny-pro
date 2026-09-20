package com.TinyPro.mock;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MockControllerTest {

    @Test
    void formMockIncludesAdvanceEndpointData() {
        MockFromController controller = new MockFromController();

        ApiResponse<Map<String, Object>> response = controller.getAdvanceData();

        assertEquals("0", response.getCode());
        assertEquals("", response.getErrMsg());
        assertTrue(response.getData().containsKey("position"));
        assertTrue(response.getData().containsKey("department"));
    }

    @Test
    void applicationMockUsesNestCompatiblePaginationEnvelope() {
        MockApplicationController controller = new MockApplicationController();

        ApiResponse<Map<String, Object>> response = controller.getApplications(
                Map.of("pageIndex", 2, "pageSize", 10)
        );

        assertEquals("0", response.getCode());
        Map<String, Object> data = response.getData();
        assertEquals(60, data.get("total"));
        assertEquals(10, ((List<?>) data.get("data")).size());
    }

    @Test
    void employeeMockSupportsDetailAndUpdateEndpoints() {
        MockListController controller = new MockListController();

        Map<String, Object> employee = controller.getEmployeeInfo(Map.of("id", "1"));
        assertEquals("1", employee.get("id"));

        boolean updated = controller.updateEmployeeInfo(Map.of(
                "data", Map.of("id", "1", "name", "updated")
        ));
        assertTrue(updated);
        assertEquals("updated", controller.getEmployeeInfo(Map.of("id", "1")).get("name"));
    }

    @Test
    void userMockContainsAllSetupMonthData() {
        UserDataController controller = new UserDataController();

        ApiResponse<Map<String, Object>> response = controller.getUserData(Map.of());
        List<Map<String, Object>> chartData = (List<Map<String, Object>>) response.getData().get("chartData");

        assertEquals(18, chartData.size());
        assertEquals("userInfo.month.1", chartData.get(1).get("title"));
        assertEquals("userInfo.month.17", chartData.get(17).get("title"));
    }
}
