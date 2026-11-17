package com.TinyPro.jpa;

import com.TinyPro.entity.po.ProjectStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProjectStageRepository extends JpaRepository<ProjectStage, Long> {

    List<ProjectStage> findAllByProjectIdInOrderByProjectIdAscSortOrderAscIdAsc(
            Collection<Long> projectIds);
}
