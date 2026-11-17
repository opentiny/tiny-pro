package com.TinyPro.jpa;

import com.TinyPro.entity.po.Editor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CRUD repository for rich-text editor documents.
 *
 * JpaRepository already provides save, findById/findAll, deleteById and delete
 * operations. The methods below cover the common editor list filters.
 */
@Repository
public interface EditorRepository extends JpaRepository<Editor, Long>, JpaSpecificationExecutor<Editor> {

    Optional<Editor> findFirstByNameOrderByIdAsc(String name);

    List<Editor> findAllByOrderByTimeDescIdDesc();

    List<Editor> findByDepartmentOrderByTimeDescIdDesc(String department);

    List<Editor> findByNameContainingIgnoreCaseOrderByTimeDescIdDesc(String name);
}
