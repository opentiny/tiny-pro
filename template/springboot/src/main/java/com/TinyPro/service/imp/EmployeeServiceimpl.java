package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Employee;

import com.TinyPro.jpa.IEmployeRepository;
import com.TinyPro.service.IEmployeeService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceimpl  implements IEmployeeService {
    @Autowired
    private IEmployeRepository iEmployeRepository;

    @Override
    public List<Employee> list(List<Long> query) {
        List<Employee> allById = iEmployeRepository.findAllById(query);
        return allById;
    }

    @Override
    public Employee getById(String id) {
        Optional<Employee> byId = iEmployeRepository.findById(Long.valueOf(id));
        return byId.get();
    }
    @Override
    public void remove(String Id) {
      Employee employee = iEmployeRepository.findById(Long.valueOf(Id)).get();
      iEmployeRepository.delete(employee);
    }
}
