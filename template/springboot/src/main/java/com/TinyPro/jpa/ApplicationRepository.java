package com.TinyPro.jpa;

import com.TinyPro.entity.po.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {
  Application findByName(String name);
  boolean existsByName(String name);
}
