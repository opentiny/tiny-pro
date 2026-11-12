import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

const employeeSeed: Employee[] = [
  {
    id: 'EMP-DB-001',
    name: '周明轩',
    employeeNo: 'DB2026001',
    department: '云平台部',
    departmentLevel: '二级',
    status: '1',
    workbenchName: 'develop',
    project: 'CloudConsole',
    type: 'Backend',
    address: '杭州研发中心',
    roles: '后端',
    lastUpdateUser: '许文静',
    createTime: '2026-08-12 09:20:00',
    rank: '高级',
    description: '负责云平台资源编排与数据库接口建设',
  },
  {
    id: 'EMP-DB-002',
    name: '林佳怡',
    employeeNo: 'DB2026002',
    department: '体验设计部',
    departmentLevel: '一级',
    status: '2',
    workbenchName: 'design',
    project: 'DesignCenter',
    type: 'UX Design',
    address: '深圳设计中心',
    roles: '设计',
    lastUpdateUser: '周明轩',
    createTime: '2026-08-18 14:35:00',
    rank: '中级',
    description: '负责管理后台体验优化与交互规范落地',
  },
  {
    id: 'EMP-DB-003',
    name: '黄志强',
    employeeNo: 'DB2026003',
    department: '质量保障部',
    departmentLevel: '三级',
    status: '0',
    workbenchName: 'test',
    project: 'QualityGateway',
    type: 'Fullstack',
    address: '南京研究所',
    roles: '测试',
    lastUpdateUser: '林佳怡',
    createTime: '2026-09-03 11:10:00',
    rank: '资深',
    description: '负责接口自动化和质量门禁平台建设',
  },
  {
    id: 'EMP-DB-004',
    name: '苏婉清',
    employeeNo: 'DB2026004',
    department: '产品运营部',
    departmentLevel: '二级',
    status: '1',
    workbenchName: 'manage',
    project: 'OperationPortal',
    type: 'Tiny Design',
    address: '北京产品中心',
    roles: '产品',
    lastUpdateUser: '黄志强',
    createTime: '2026-09-16 16:45:00',
    rank: '专家',
    description: '负责产品运营规划和跨团队项目协同',
  },
  {
    id: 'EMP-DB-005',
    name: '何宇辰',
    employeeNo: 'DB2026005',
    department: '前端技术部',
    departmentLevel: '四级',
    status: '2',
    workbenchName: 'work',
    project: 'WebWorkspace',
    type: 'Frontend',
    address: '成都软件园',
    roles: '前端',
    lastUpdateUser: '苏婉清',
    createTime: '2026-10-06 10:05:00',
    rank: '初级',
    description: '负责企业工作台页面开发与性能优化',
  },
];

@Injectable()
export class EmployeesInitializer implements OnModuleInit {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
  ) {}

  async onModuleInit() {
    if ((await this.employeeRepository.count()) > 0) {
      return;
    }
    await this.employeeRepository.save(employeeSeed);
  }
}
