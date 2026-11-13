package com.TinyPro.jpa;

import com.TinyPro.entity.po.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface IEmployeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    java.util.Optional<Employee> findByEmployeeNo(String employeeNo);
}
