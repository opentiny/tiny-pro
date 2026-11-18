package com.TinyPro.entity.po;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Project master record used by the project list and detail pages.
 */
@Data
@Entity
@DynamicUpdate
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_name", nullable = false, length = 255)
    private String projectName;

    @Column(name = "project_code", nullable = false, unique = true, length = 64)
    private String projectCode;

    @Column(name = "project_status", nullable = false, length = 16)
    private String projectStatus = "0";

    @Column(name = "task_status", nullable = false, length = 16)
    private String taskStatus = "0";

    @Column(name = "department", nullable = false, length = 255)
    private String department = "";

    @Column(name = "start_time")
    private LocalDate startTime;

    @Column(name = "end_time")
    private LocalDate endTime;

    @Column(name = "priority", nullable = false, length = 16)
    private String priority = "1";

    @Column(name = "owner", nullable = false, length = 255)
    private String owner;

    @Column(name = "progress", nullable = false, precision = 5, scale = 2)
    private BigDecimal progress = BigDecimal.ZERO;

    @Column(name = "man_hours", precision = 10, scale = 2)
    private BigDecimal manHours;

    @Column(name = "budget", precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "team_size")
    private Integer teamSize;

    @Column(name = "goal", columnDefinition = "TEXT")
    private String goal;

    @Column(name = "technology", columnDefinition = "TEXT")
    private String technology;

    @Column(name = "partner", columnDefinition = "TEXT")
    private String partner;

    @Column(name = "risk_level", length = 16)
    private String riskLevel;

    @Column(name = "quality", columnDefinition = "TEXT")
    private String quality;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
