package com.TinyPro.jpa;

import com.TinyPro.entity.po.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    List<Project> findAllByOrderByIdAsc();

    boolean existsByProjectCode(String projectCode);

    boolean existsByProjectCodeAndIdNot(String projectCode, Long id);
}
