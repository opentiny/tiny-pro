package com.TinyPro.jpa;

import com.TinyPro.entity.po.Employee;
import com.TinyPro.entity.po.I18;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IEmployeRepository extends JpaRepository<Employee, Long> {
}
