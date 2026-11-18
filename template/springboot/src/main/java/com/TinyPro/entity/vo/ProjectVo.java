package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Project;
import com.TinyPro.entity.po.ProjectStage;
import com.TinyPro.entity.po.ProjectVersion;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Project list response. The ID is exposed as a string to match the frontend
 * project contract.
 */
@Data
public class ProjectVo {

    private String id;
    private String projectName;
    private String projectCode;
    private String projectStatus;
    private String taskStatus;
    private String department;
    private String startTime;
    private String endTime;
    private String priority;
    private String owner;
    private BigDecimal progress;
    private BigDecimal manHours;
    private BigDecimal budget;
    private Integer teamSize;
    private String goal;
    private String technology;
    private String partner;
    private String riskLevel;
    private String quality;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ProjectVersion> versions;
    private List<ProjectStage> stages;

    public static ProjectVo from(Project project) {
        return from(project, List.of(), List.of());
    }

    public static ProjectVo from(
            Project project,
            List<ProjectVersion> versions,
            List<ProjectStage> stages) {
        if (project == null) {
            return null;
        }
        ProjectVo vo = new ProjectVo();
        vo.id = project.getId() == null ? null : String.valueOf(project.getId());
        vo.projectName = project.getProjectName();
        vo.projectCode = project.getProjectCode();
        vo.projectStatus = project.getProjectStatus();
        vo.taskStatus = project.getTaskStatus();
        vo.department = project.getDepartment();
        vo.startTime = formatDate(project.getStartTime());
        vo.endTime = formatDate(project.getEndTime());
        vo.priority = project.getPriority();
        vo.owner = project.getOwner();
        vo.progress = project.getProgress();
        vo.manHours = project.getManHours();
        vo.budget = project.getBudget();
        vo.teamSize = project.getTeamSize();
        vo.goal = project.getGoal();
        vo.technology = project.getTechnology();
        vo.partner = project.getPartner();
        vo.riskLevel = project.getRiskLevel();
        vo.quality = project.getQuality();
        vo.remark = project.getRemark();
        vo.createdAt = project.getCreatedAt();
        vo.updatedAt = project.getUpdatedAt();
        vo.versions = versions == null ? List.of() : versions;
        vo.stages = stages == null ? List.of() : stages;
        return vo;
    }

    private static String formatDate(LocalDate date) {
        return date == null ? "" : date.toString();
    }
}
