package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.EmployeeQueryDto;
import com.TinyPro.entity.dto.EmployeeSearchFilterDto;
import com.TinyPro.entity.dto.EmployeeSearchInfoDto;
import com.TinyPro.entity.po.Employee;
import com.TinyPro.entity.vo.EmployeePageVo;
import com.TinyPro.entity.vo.EmployeeVo;
import com.TinyPro.jpa.IEmployeRepository;
import com.TinyPro.service.IEmployeeService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EmployeeServiceimpl implements IEmployeeService {

    private static final int DEFAULT_PAGE_INDEX = 1;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    private static final Set<String> TEXT_FIELDS = Set.of(
            "name", "employeeNo", "department", "departmentLevel", "workbenchName",
            "project", "type", "address", "roles", "lastUpdateUser", "createTime",
            "status"
    );

    private static final Set<String> FILTER_FIELDS = Set.of(
            "name", "employeeNo", "departmentLevel", "department", "status",
            "workbenchName", "project", "type", "address", "roles", "lastUpdateUser"
    );

    private static final Set<String> RANGE_FIELDS = new LinkedHashSet<>();

    private static final Set<String> FUZZY_FIELDS = Set.of("name", "employeeNo");

    private static final DateTimeFormatter[] DATE_TIME_FORMATTERS = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd")
    };

    private final IEmployeRepository iEmployeRepository;

    @PersistenceContext
    private EntityManager entityManager;

    static {
        RANGE_FIELDS.addAll(FILTER_FIELDS);
        RANGE_FIELDS.add("createTime");
    }

    public EmployeeServiceimpl(IEmployeRepository iEmployeRepository) {
        this.iEmployeRepository = iEmployeRepository;
    }

    @Override
    public List<Employee> list(List<Long> query) {
        List<Employee> allById = iEmployeRepository.findAllById(query);
        return allById;
    }

    @Override
    public EmployeePageVo queryPage(EmployeeQueryDto query) {
        int pageIndex = normalizePageValue(query == null ? null : query.getPageIndex(), DEFAULT_PAGE_INDEX);
        int pageSize = Math.min(
                normalizePageValue(query == null ? null : query.getPageSize(), DEFAULT_PAGE_SIZE),
                MAX_PAGE_SIZE
        );
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        EmployeeSearchInfoDto searchInfo = query == null ? null : query.getSearchInfo();
        Page<Employee> page = iEmployeRepository.findAll(buildSpecification(searchInfo), pageable);
        List<EmployeeVo> data = page.getContent().stream()
                .map(EmployeeVo::from)
                .toList();
        return new EmployeePageVo(page.getTotalElements(), data, buildFilterOptions());
    }

    @Override
    public Employee getById(String id) {
        Long employeeId = parseId(id);
        if (employeeId == null) {
            return null;
        }
        Optional<Employee> byId = iEmployeRepository.findById(employeeId);
        return byId.orElse(null);
    }

    @Override
    @Transactional
    public boolean update(Map<String, Object> data) {
        if (data == null) {
            return false;
        }
        Employee employee = getById(String.valueOf(data.getOrDefault("id", "")));
        if (employee == null) {
            return false;
        }
        updateStringField(data, "name", employee::setName);
        updateStringField(data, "employeeNo", employee::setEmployeeNo);
        updateStringField(data, "department", employee::setDepartment);
        updateStringField(data, "departmentLevel", employee::setDepartmentLevel);
        updateStringField(data, "status", employee::setStatus);
        updateStringField(data, "workbenchName", employee::setWorkbenchName);
        updateStringField(data, "project", employee::setProject);
        updateStringField(data, "type", employee::setType);
        updateStringField(data, "address", employee::setAddress);
        updateStringField(data, "roles", employee::setRoles);
        updateStringField(data, "lastUpdateUser", employee::setLastUpdateUser);
        Object createTime = data.get("createTime");
        if (createTime instanceof String value) {
            LocalDateTime parsed = parseDateTime(value);
            if (parsed != null) {
                employee.setCreateTime(parsed);
            }
        }
        iEmployeRepository.save(employee);
        return true;
    }

    @Override
    @Transactional
    public boolean remove(String id) {
        Long employeeId = parseId(id);
        if (employeeId == null) {
            return true;
        }
        iEmployeRepository.findById(employeeId).ifPresent(iEmployeRepository::delete);
        return true;
    }

    private Specification<Employee> buildSpecification(EmployeeSearchInfoDto searchInfo) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            addKeywordPredicates(predicates, root, criteriaBuilder, searchInfo);
            addFilterPredicates(predicates, root, criteriaBuilder, searchInfo);
            return predicates.isEmpty()
                    ? criteriaBuilder.conjunction()
                    : criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void addKeywordPredicates(
            List<Predicate> predicates,
            Root<Employee> root,
            CriteriaBuilder criteriaBuilder,
            EmployeeSearchInfoDto searchInfo) {
        if (searchInfo == null || searchInfo.getKeyword() == null) {
            return;
        }
        String keyword = searchInfo.getKeyword().trim();
        if (keyword.isBlank()) {
            return;
        }
        for (String token : keyword.split("\\s+")) {
            String pattern = "%" + token.toLowerCase(Locale.ROOT) + "%";
            Predicate[] matches = TEXT_FIELDS.stream()
                    .map(field -> criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(field).as(String.class)), pattern))
                    .toArray(Predicate[]::new);
            predicates.add(criteriaBuilder.or(matches));
        }
    }

    private void addFilterPredicates(
            List<Predicate> predicates,
            Root<Employee> root,
            CriteriaBuilder criteriaBuilder,
            EmployeeSearchInfoDto searchInfo) {
        if (searchInfo == null || searchInfo.getFilters() == null) {
            return;
        }
        for (EmployeeSearchFilterDto filter : searchInfo.getFilters()) {
            if (filter == null || !RANGE_FIELDS.contains(filter.getField())) {
                continue;
            }
            String field = filter.getField();
            if (hasText(filter.getStart()) || hasText(filter.getEnd())) {
                addRangePredicate(predicates, root, criteriaBuilder, field, filter);
                continue;
            }
            List<String> values = toValues(filter.getValues());
            if (values.isEmpty()) {
                continue;
            }
            if (FUZZY_FIELDS.contains(field)) {
                Predicate[] fuzzyMatches = values.stream()
                        .map(value -> criteriaBuilder.like(
                                criteriaBuilder.lower(root.get(field).as(String.class)),
                                "%" + value.toLowerCase(Locale.ROOT) + "%"))
                        .toArray(Predicate[]::new);
                predicates.add(criteriaBuilder.or(fuzzyMatches));
            } else {
                predicates.add(root.get(field).in(values));
            }
        }
    }

    private void addRangePredicate(
            List<Predicate> predicates,
            Root<Employee> root,
            CriteriaBuilder criteriaBuilder,
            String field,
            EmployeeSearchFilterDto filter) {
        if ("createTime".equals(field)) {
            LocalDateTime start = parseDateTime(filter.getStart(), false);
            LocalDateTime end = parseDateTime(filter.getEnd(), true);
            if (start != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(field), start));
            }
            if (end != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(field), end));
            }
            return;
        }
        Expression<String> value = root.get(field).as(String.class);
        if (hasText(filter.getStart())) {
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(value, filter.getStart()));
        }
        if (hasText(filter.getEnd())) {
            predicates.add(criteriaBuilder.lessThanOrEqualTo(value, filter.getEnd()));
        }
    }

    private Map<String, Object> buildFilterOptions() {
        Map<String, Object> filters = new LinkedHashMap<>();
        for (String field : FILTER_FIELDS) {
            filters.put(field, findDistinctValues(field));
        }
        filters.put("createTime", Map.of(
                "min", formatTime(findCreateTime(true)),
                "max", formatTime(findCreateTime(false))
        ));
        return filters;
    }

    private List<String> findDistinctValues(String field) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<String> query = criteriaBuilder.createQuery(String.class);
        Root<Employee> root = query.from(Employee.class);
        Expression<String> selectedValue = root.get(field).as(String.class);
        query.select(selectedValue)
                .where(criteriaBuilder.isNotNull(root.get(field)))
                .distinct(true)
                .orderBy(criteriaBuilder.asc(selectedValue));
        return entityManager.createQuery(query).getResultList();
    }

    private LocalDateTime findCreateTime(boolean minimum) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<LocalDateTime> query = criteriaBuilder.createQuery(LocalDateTime.class);
        Root<Employee> root = query.from(Employee.class);
        query.select(root.get("createTime"))
                .where(criteriaBuilder.isNotNull(root.get("createTime")))
                .orderBy(minimum
                        ? criteriaBuilder.asc(root.get("createTime"))
                        : criteriaBuilder.desc(root.get("createTime")));
        return entityManager.createQuery(query)
                .setMaxResults(1)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    private List<String> toValues(List<Object> rawValues) {
        if (rawValues == null) {
            return Collections.emptyList();
        }
        return rawValues.stream()
                .filter(value -> value != null && !String.valueOf(value).isBlank())
                .map(value -> String.valueOf(value).trim())
                .distinct()
                .collect(Collectors.toList());
    }

    private void updateStringField(Map<String, Object> data, String field, java.util.function.Consumer<String> setter) {
        Object value = data.get(field);
        if (value instanceof String stringValue) {
            setter.accept(stringValue);
        }
    }

    private int normalizePageValue(Integer value, int fallback) {
        return value == null ? fallback : Math.max(1, value);
    }

    private Long parseId(String value) {
        try {
            return value == null || value.isBlank() ? null : Long.valueOf(value);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private LocalDateTime parseDateTime(String value) {
        return parseDateTime(value, false);
    }

    private LocalDateTime parseDateTime(String value, boolean endOfDay) {
        if (!hasText(value)) {
            return null;
        }
        String normalized = value.trim().replace('/', '-');
        for (DateTimeFormatter formatter : DATE_TIME_FORMATTERS) {
            try {
                return LocalDateTime.parse(normalized, formatter);
            } catch (DateTimeParseException ignored) {
                // Try the next supported input format.
            }
        }
        try {
            return LocalDate.parse(normalized).atTime(endOfDay ? LocalTime.MAX : LocalTime.MIN);
        } catch (DateTimeParseException ignored) {
            // Ignore invalid range values, matching the permissive NestJS query behavior.
        }
        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String formatTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMATTERS[0]);
    }
}
