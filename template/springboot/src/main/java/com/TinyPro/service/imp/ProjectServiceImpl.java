package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.ProjectCreateRequest;
import com.TinyPro.entity.po.Project;
import com.TinyPro.entity.po.ProjectStage;
import com.TinyPro.entity.po.ProjectVersion;
import com.TinyPro.entity.vo.ProjectVo;
import com.TinyPro.jpa.ProjectStageRepository;
import com.TinyPro.jpa.ProjectRepository;
import com.TinyPro.jpa.ProjectVersionRepository;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectVersionRepository projectVersionRepository;
    private final ProjectStageRepository projectStageRepository;

    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            ProjectVersionRepository projectVersionRepository,
            ProjectStageRepository projectStageRepository) {
        this.projectRepository = projectRepository;
        this.projectVersionRepository = projectVersionRepository;
        this.projectStageRepository = projectStageRepository;
    }

    @Override
    public ApiResponse<List<ProjectVo>> getProjectList() {
        List<Project> projectEntities = projectRepository.findAllByOrderByIdAsc();
        if (projectEntities.isEmpty()) {
            return ApiResponse.success(List.of());
        }

        List<Long> projectIds = projectEntities.stream()
                .map(Project::getId)
                .toList();
        Map<Long, List<ProjectVersion>> versionsByProject = projectVersionRepository
                .findAllByProjectIdInOrderByProjectIdAscReleaseDateDescIdAsc(projectIds)
                .stream()
                .collect(Collectors.groupingBy(
                        ProjectVersion::getProjectId,
                        LinkedHashMap::new,
                        Collectors.toList()));
        Map<Long, List<ProjectStage>> stagesByProject = projectStageRepository
                .findAllByProjectIdInOrderByProjectIdAscSortOrderAscIdAsc(projectIds)
                .stream()
                .collect(Collectors.groupingBy(
                        ProjectStage::getProjectId,
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<ProjectVo> projects = projectEntities.stream()
                .map(project -> ProjectVo.from(
                        project,
                        versionsByProject.getOrDefault(project.getId(), List.of()),
                        stagesByProject.getOrDefault(project.getId(), List.of())))
                .toList();
        return ApiResponse.success(projects);
    }

    @Override
    @Transactional
    public ApiResponse<ProjectVo> createProject(ProjectCreateRequest request) {
        Map<String, Object> data = request == null || request.getData() == null
                ? Collections.emptyMap()
                : request.getData();

        List<String> requiredFields = List.of("projectName", "projectCode", "owner");
        List<String> missingFields = requiredFields.stream()
                .filter(field -> text(data, field, "").isBlank())
                .toList();
        if (!missingFields.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Missing required fields: " + String.join(", ", missingFields));
        }

        String projectName = text(data, "projectName", "");
        String projectCode = text(data, "projectCode", "");
        String owner = text(data, "owner", "");

        if (projectRepository.existsByProjectCode(projectCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project code already exists");
        }

        Project project = new Project();
        applyProjectFields(project, data, true);

        Project saved = projectRepository.saveAndFlush(project);
        return ApiResponse.success(ProjectVo.from(saved, List.of(), List.of()));
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> updateProject(ProjectCreateRequest request) {
        Map<String, Object> data = request == null || request.getData() == null
                ? Collections.emptyMap()
                : request.getData();
        Long id = longValue(data, "id");
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project id is required");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        String projectCode = text(data, "projectCode", project.getProjectCode());
        if (projectRepository.existsByProjectCodeAndIdNot(projectCode, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project code already exists");
        }

        applyProjectFields(project, data, false);
        validateRequiredFields(project);
        projectRepository.saveAndFlush(project);
        return ApiResponse.success(true);
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteProject(String id) {
        Long projectId = id == null || id.isBlank()
                ? null
                : parseLong(id, "id");
        if (projectId != null && projectRepository.existsById(projectId)) {
            projectRepository.deleteById(projectId);
        }
        // Match NestJS remove(): deleting a missing id is still successful.
        return ApiResponse.success(true);
    }

    private void applyProjectFields(Project project, Map<String, Object> data, boolean create) {
        if (create || data.containsKey("projectName")) {
            project.setProjectName(text(data, "projectName", create ? "" : project.getProjectName()));
        }
        if (create || data.containsKey("projectCode")) {
            project.setProjectCode(text(data, "projectCode", create ? "" : project.getProjectCode()));
        }
        if (create || data.containsKey("projectStatus")) {
            project.setProjectStatus(text(data, "projectStatus", create ? "0" : project.getProjectStatus()));
        }
        if (create || data.containsKey("taskStatus")) {
            project.setTaskStatus(text(data, "taskStatus", create ? "0" : project.getTaskStatus()));
        }
        if (create || data.containsKey("department")) {
            project.setDepartment(text(data, "department", create ? "" : project.getDepartment()));
        }
        if (create || data.containsKey("startTime")) {
            project.setStartTime(date(data, "startTime"));
        }
        if (create || data.containsKey("endTime")) {
            project.setEndTime(date(data, "endTime"));
        }
        if (create || data.containsKey("priority")) {
            project.setPriority(text(data, "priority", create ? "1" : project.getPriority()));
        }
        if (create || data.containsKey("owner")) {
            project.setOwner(text(data, "owner", create ? "" : project.getOwner()));
        }
        if (create || data.containsKey("progress")) {
            project.setProgress(decimal(data, "progress", create ? BigDecimal.ZERO : project.getProgress()));
        }
        if (create || data.containsKey("manHours")) {
            project.setManHours(decimal(data, "manHours", create ? BigDecimal.ZERO : project.getManHours()));
        }
        if (create || data.containsKey("budget")) {
            project.setBudget(decimal(data, "budget", create ? BigDecimal.ZERO : project.getBudget()));
        }
        if (create || data.containsKey("teamSize")) {
            project.setTeamSize(integer(data, "teamSize", create ? 0 : project.getTeamSize()));
        }
        if (create || data.containsKey("goal")) {
            project.setGoal(text(data, "goal", create ? "" : project.getGoal()));
        }
        if (create || data.containsKey("technology")) {
            project.setTechnology(text(data, "technology", create ? "" : project.getTechnology()));
        }
        if (create || data.containsKey("partner")) {
            project.setPartner(text(data, "partner", create ? "" : project.getPartner()));
        }
        if (create || data.containsKey("riskLevel")) {
            project.setRiskLevel(text(data, "riskLevel", create ? "" : project.getRiskLevel()));
        }
        if (create || data.containsKey("quality")) {
            project.setQuality(text(data, "quality", create ? "" : project.getQuality()));
        }
        if (create || data.containsKey("remark")) {
            project.setRemark(text(data, "remark", create ? "" : project.getRemark()));
        }
    }

    private void validateRequiredFields(Project project) {
        List<String> missingFields = new java.util.ArrayList<>();
        if (project.getProjectName() == null || project.getProjectName().isBlank()) {
            missingFields.add("projectName");
        }
        if (project.getProjectCode() == null || project.getProjectCode().isBlank()) {
            missingFields.add("projectCode");
        }
        if (project.getOwner() == null || project.getOwner().isBlank()) {
            missingFields.add("owner");
        }
        if (!missingFields.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Missing required fields: " + String.join(", ", missingFields));
        }
    }

    private String text(Map<String, Object> data, String field, String defaultValue) {
        Object value = data.get(field);
        return value == null ? Objects.requireNonNullElse(defaultValue, "") : String.valueOf(value).trim();
    }

    private LocalDate date(Map<String, Object> data, String field) {
        String value = text(data, field, "");
        if (value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " format is invalid");
        }
    }

    private BigDecimal decimal(Map<String, Object> data, String field, BigDecimal defaultValue) {
        BigDecimal value = decimalOrNull(data, field);
        return value == null ? defaultValue : value;
    }

    private BigDecimal decimalOrNull(Map<String, Object> data, String field) {
        Object value = data.get(field);
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " must be a number");
        }
    }

    private Integer integer(Map<String, Object> data, String field, Integer defaultValue) {
        Integer value = integerOrNull(data, field);
        return value == null ? defaultValue : value;
    }

    private Integer integerOrNull(Map<String, Object> data, String field) {
        Object value = data.get(field);
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(String.valueOf(value));
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " must be an integer");
        }
    }

    private Long longValue(Map<String, Object> data, String field) {
        Object value = data.get(field);
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return parseLong(String.valueOf(value), field);
    }

    private Long parseLong(String value, String field) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " must be an integer");
        }
    }
}
