package com.TinyPro.service.imp;

import com.TinyPro.entity.po.Employee;
import com.TinyPro.mappers.EmployeeMapper;
import com.TinyPro.service.IEmployeeService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class EmployeeServiceimpl extends ServiceImpl<EmployeeMapper, Employee> implements IEmployeeService {

}
