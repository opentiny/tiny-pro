import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

const projectSeed: Project[] = [
  {
    id: 'PRJ-DB-001',
    projectName: '云资源运营平台',
    projectCode: 'DB-CLOUD-001',
    projectStatus: '1',
    taskStatus: '0',
    department: '云平台部',
    startTime: '2026-07-01',
    endTime: '2026-12-20',
    priority: '0',
    owner: '周明轩',
  },
  {
    id: 'PRJ-DB-002',
    projectName: '企业设计资产中心',
    projectCode: 'DB-DESIGN-002',
    projectStatus: '2',
    taskStatus: '1',
    department: '体验设计部',
    startTime: '2026-05-15',
    endTime: '2026-09-30',
    priority: '1',
    owner: '林佳怡',
  },
  {
    id: 'PRJ-DB-003',
    projectName: '接口质量网关',
    projectCode: 'DB-QUALITY-003',
    projectStatus: '1',
    taskStatus: '0',
    department: '质量保障部',
    startTime: '2026-08-10',
    endTime: '2027-01-15',
    priority: '0',
    owner: '黄志强',
  },
  {
    id: 'PRJ-DB-004',
    projectName: '客户成功工作台',
    projectCode: 'DB-SUCCESS-004',
    projectStatus: '3',
    taskStatus: '2',
    department: '产品运营部',
    startTime: '2026-06-20',
    endTime: '2026-11-30',
    priority: '2',
    owner: '苏婉清',
  },
  {
    id: 'PRJ-DB-005',
    projectName: '统一 Web 工作空间',
    projectCode: 'DB-WEB-005',
    projectStatus: '0',
    taskStatus: '1',
    department: '前端技术部',
    startTime: '2026-10-12',
    endTime: '2027-03-31',
    priority: '1',
    owner: '何宇辰',
  },
];

@Injectable()
export class ProjectInitializer implements OnModuleInit {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  async onModuleInit() {
    if ((await this.projectRepository.count()) > 0) {
      return;
    }
    await this.projectRepository.save(projectSeed);
  }
}
