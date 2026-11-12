package com.TinyPro.service;

import com.TinyPro.entity.dto.EmployeeQueryDto;
import com.TinyPro.entity.dto.EmployeeCreateRequest;
import com.TinyPro.entity.dto.EmployeeSearchFilterDto;
import com.TinyPro.entity.dto.EmployeeSearchInfoDto;
import com.TinyPro.entity.po.Employee;
import com.TinyPro.entity.vo.EmployeePageVo;
import com.TinyPro.jpa.IEmployeRepository;
import com.TinyPro.service.imp.EmployeeServiceimpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@Import(EmployeeServiceimpl.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:employee_service;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.jpa.properties.hibernate.globally_quoted_identifiers=true"
})
class EmployeeServiceTest {

    @Autowired
    private IEmployeRepository employeeRepository;

    @Autowired
    private IEmployeeService employeeService;

    @BeforeEach
    void setUp() {
        employeeRepository.saveAll(List.of(
                employee("张伟", "技术部", "1", "2024-01-01 08:00:00"),
                employee("李娜", "技术部", "1", "2024-06-01 08:00:00"),
                employee("王芳", "产品部", "2", "2025-01-01 08:00:00")
        ));
    }

    @Test
    void queryPageSupportsNestCompatibleSearchAndFilters() {
        EmployeeQueryDto query = new EmployeeQueryDto();
        query.setPageIndex(1);
        query.setPageSize(1);

        EmployeeSearchInfoDto searchInfo = new EmployeeSearchInfoDto();
        searchInfo.setKeyword("张伟 技术部");
        EmployeeSearchFilterDto department = new EmployeeSearchFilterDto();
        department.setField("department");
        department.setValues(List.of("技术部"));
        searchInfo.setFilters(List.of(department));
        query.setSearchInfo(searchInfo);

        EmployeePageVo result = employeeService.queryPage(query);

        assertEquals(1, result.getTotal());
        assertEquals(1, result.getData().size());
        assertEquals("张伟", result.getData().get(0).getName());
        assertTrue(result.getFilters().containsKey("createTime"));
        assertTrue(result.getFilters().containsKey("department"));
    }

    @Test
    void queryPageSupportsCreateTimeRangeAndCapsPageSize() {
        EmployeeQueryDto query = new EmployeeQueryDto();
        query.setPageSize(1000);

        EmployeeSearchInfoDto searchInfo = new EmployeeSearchInfoDto();
        EmployeeSearchFilterDto createTime = new EmployeeSearchFilterDto();
        createTime.setField("createTime");
        createTime.setStart("2024-01-01");
        createTime.setEnd("2024-12-31");
        searchInfo.setFilters(List.of(createTime));
        query.setSearchInfo(searchInfo);

        EmployeePageVo result = employeeService.queryPage(query);

        assertEquals(2, result.getTotal());
        assertEquals(2, result.getData().size());
    }

    @Test
    void treatsLikeWildcardsAsLiteralSearchText() {
        Employee literal = employee("100%员工", "技术部", "1", "2024-03-01 08:00:00");
        literal.setEmployeeNo("00_000001");
        employeeRepository.saveAndFlush(literal);

        EmployeeQueryDto keywordQuery = new EmployeeQueryDto();
        EmployeeSearchInfoDto keywordInfo = new EmployeeSearchInfoDto();
        keywordInfo.setKeyword("%");
        keywordQuery.setSearchInfo(keywordInfo);

        EmployeePageVo keywordResult = employeeService.queryPage(keywordQuery);

        assertEquals(1, keywordResult.getTotal());
        assertEquals("100%员工", keywordResult.getData().get(0).getName());

        EmployeeQueryDto filterQuery = new EmployeeQueryDto();
        EmployeeSearchInfoDto filterInfo = new EmployeeSearchInfoDto();
        EmployeeSearchFilterDto nameFilter = new EmployeeSearchFilterDto();
        nameFilter.setField("name");
        nameFilter.setValues(List.of("%"));
        filterInfo.setFilters(List.of(nameFilter));
        filterQuery.setSearchInfo(filterInfo);

        assertEquals(1, employeeService.queryPage(filterQuery).getTotal());
    }

    @Test
    void updateAndRemoveUseTheDatabase() {
        Employee employee = employeeRepository.findAll().get(0);

        assertTrue(employeeService.update(Map.of(
                "id", String.valueOf(employee.getId()),
                "name", "新名称"
        )));
        employeeRepository.flush();
        Employee updated = employeeRepository.findById(employee.getId()).orElseThrow();
        assertEquals("新名称", updated.getName());

        assertTrue(employeeService.remove(String.valueOf(employee.getId())));
        assertTrue(employeeRepository.findById(employee.getId()).isEmpty());
    }

    @Test
    void createPersistsAndReturnsAnEmployee() {
        EmployeeCreateRequest request = new EmployeeCreateRequest();
        request.setName("新员工");
        request.setEmployeeNo("00000061");
        request.setDepartment("技术部");
        request.setStatus("1");

        Employee created = employeeService.create(request);

        assertTrue(created.getId() != null);
        assertEquals("新员工", created.getName());
        assertEquals("00000061", created.getEmployeeNo());
        assertTrue(employeeRepository.findById(created.getId()).isPresent());
    }

    private Employee employee(String name, String department, String status, String createTime) {
        Employee employee = new Employee();
        employee.setName(name);
        employee.setEmployeeNo(name + "001");
        employee.setDepartment(department);
        employee.setDepartmentLevel("一级");
        employee.setStatus(status);
        employee.setWorkbenchName("develop");
        employee.setProject("TinyPro");
        employee.setType("Frontend");
        employee.setAddress("北京总部");
        employee.setRoles("前端");
        employee.setLastUpdateUser("测试用户");
        employee.setCreateTime(LocalDateTime.parse(createTime.replace(' ', 'T')));
        return employee;
    }
}
