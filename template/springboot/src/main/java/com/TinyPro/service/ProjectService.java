package com.TinyPro.service;

import com.TinyPro.entity.dto.ProjectCreateRequest;
import com.TinyPro.entity.vo.ProjectVo;
import com.TinyPro.mock.ApiResponse;

import java.util.List;

public interface ProjectService {

    ApiResponse<List<ProjectVo>> getProjectList();

    ApiResponse<ProjectVo> createProject(ProjectCreateRequest request);

    ApiResponse<Boolean> updateProject(ProjectCreateRequest request);

    ApiResponse<Boolean> deleteProject(String id);
}
