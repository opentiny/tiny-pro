package com.TinyPro.jpa;

import com.TinyPro.entity.po.ProjectVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProjectVersionRepository extends JpaRepository<ProjectVersion, Long> {

    List<ProjectVersion> findAllByProjectIdInOrderByProjectIdAscReleaseDateDescIdAsc(
            Collection<Long> projectIds);
}
