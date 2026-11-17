package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Project;
import com.TinyPro.entity.po.ProjectStage;
import com.TinyPro.entity.po.ProjectVersion;
import com.TinyPro.entity.vo.ProjectVo;
import com.TinyPro.jpa.ProjectStageRepository;
import com.TinyPro.jpa.ProjectRepository;
import com.TinyPro.jpa.ProjectVersionRepository;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
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
}
