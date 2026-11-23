package com.TinyPro.controller;

import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.ProjectCreateRequest;
import com.TinyPro.entity.vo.ProjectVo;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/project")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/getProjectList")
    public ApiResponse<List<ProjectVo>> getProjectList() {
        return projectService.getProjectList();
    }

    /**
     * Creates a project using the same data envelope as the NestJS endpoint.
     */
    @Reject
    @PostMapping("/create")
    public ApiResponse<ProjectVo> createProject(
            @Valid @RequestBody(required = false) ProjectCreateRequest request) {
        return projectService.createProject(request);
    }

    /**
     * Updates a project using the same data envelope as the NestJS endpoint.
     */
    @Reject
    @PostMapping("/update")
    public ApiResponse<Boolean> updateProject(
            @Valid @RequestBody(required = false) ProjectCreateRequest request) {
        return projectService.updateProject(request);
    }

    /**
     * Deletes a project using the same query parameter contract as NestJS.
     */
    @Reject
    @DeleteMapping("/delete")
    public ApiResponse<Boolean> deleteProject(
            @RequestParam(value = "id", required = false) String id) {
        return projectService.deleteProject(id);
    }
}
