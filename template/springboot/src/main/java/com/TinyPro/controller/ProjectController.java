package com.TinyPro.controller;

import com.TinyPro.entity.vo.ProjectVo;
import com.TinyPro.mock.ApiResponse;
import com.TinyPro.service.ProjectService;
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
}
