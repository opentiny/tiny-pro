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
    progress: 68,
    manHours: 320,
    budget: 180,
    teamSize: 12,
    goal: '建设统一的云资源运营入口，实现资源申请、监控和成本分析的一体化管理。',
    technology: 'Vue3 + TypeScript + TinyVue / NestJS / MySQL',
    partner: '基础设施部、财务部、安全合规部',
    riskLevel: '中',
    quality: '核心流程自动化测试覆盖率不低于 85%，资源操作具备完整审计记录。',
    remark: '当前重点跟进多云账单口径统一和存量资源数据核对。',
    versions: [
      {
        id: 'PRJ-DB-001-V090',
        version: 'V0.9.0',
        date: '2026-08-01',
        content: '上线资源目录和申请审批流程',
        status: '0',
        owner: '周明轩',
      },
      {
        id: 'PRJ-DB-001-V100',
        version: 'V1.0.0-rc',
        date: '2026-11-01',
        content: '发布成本分析与资源监控候选版本',
        status: '1',
        owner: '周明轩',
      },
      {
        id: 'PRJ-DB-001-V110',
        version: 'V1.1.0',
        date: '-',
        content: '规划多云账单统一和预算预警能力',
        status: '2',
        owner: '周明轩',
      },
    ],
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
    progress: 100,
    manHours: 260,
    budget: 120,
    teamSize: 8,
    goal: '沉淀企业级设计资产，统一组件、图标和页面模板的使用规范。',
    technology: 'Vue3 + TinyVue / NestJS / MinIO',
    partner: '前端技术部、品牌设计组、产品运营部',
    riskLevel: '低',
    quality: '资产检索响应时间小于 500 毫秒，发布流程经过设计和研发双重审核。',
    remark: '项目已完成验收，后续转入资产运营和版本维护阶段。',
    versions: [
      {
        id: 'PRJ-DB-002-V100',
        version: 'V1.0.0',
        date: '2026-08-18',
        content: '正式发布组件资产库和权限管理',
        status: '0',
        owner: '林佳怡',
      },
      {
        id: 'PRJ-DB-002-V110',
        version: 'V1.1.0',
        date: '2026-09-28',
        content: '补充页面模板、资产收藏和下载统计',
        status: '0',
        owner: '林佳怡',
      },
    ],
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
    progress: 45,
    manHours: 400,
    budget: 220,
    teamSize: 10,
    goal: '建立接口质量门禁，集中管理契约检查、自动化回归和异常追踪。',
    technology: 'Vue3 + TinyVue / NestJS / Redis / MySQL',
    partner: '平台架构部、各业务研发组',
    riskLevel: '中',
    quality: '质量规则执行结果可追溯，核心回归任务成功率不低于 99%。',
    remark: '需关注历史接口契约不完整的问题，先覆盖核心交易链路。',
    versions: [
      {
        id: 'PRJ-DB-003-V060',
        version: 'V0.6.0',
        date: '2026-09-20',
        content: '完成接口导入和基础契约校验',
        status: '0',
        owner: '黄志强',
      },
      {
        id: 'PRJ-DB-003-V080',
        version: 'V0.8.0',
        date: '2026-12-10',
        content: '计划开放回归任务调度和质量报告',
        status: '1',
        owner: '黄志强',
      },
    ],
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
    progress: 38,
    manHours: 180,
    budget: 90,
    teamSize: 7,
    goal: '整合客户画像、健康度和服务任务，提升客户成功团队的跟进效率。',
    technology: 'Vue3 + TypeScript + TinyVue / SpringBoot',
    partner: '销售运营部、客户服务中心、数据分析部',
    riskLevel: '高',
    quality: '客户数据按角色隔离，关键服务动作需要保留操作日志。',
    remark: '因客户健康度指标尚未统一而暂停，等待业务侧完成指标评审。',
    versions: [
      {
        id: 'PRJ-DB-004-V050',
        version: 'V0.5.0',
        date: '2026-08-12',
        content: '完成客户列表和服务任务看板原型验证',
        status: '0',
        owner: '苏婉清',
      },
      {
        id: 'PRJ-DB-004-V100',
        version: 'V1.0.0',
        date: '-',
        content: '规划客户健康度评分与风险提醒',
        status: '2',
        owner: '苏婉清',
      },
    ],
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
    progress: 10,
    manHours: 480,
    budget: 260,
    teamSize: 14,
    goal: '打造统一的企业 Web 工作空间，整合应用导航、待办和个性化布局。',
    technology: 'Vue3 + TypeScript + TinyVue / Vite / NestJS',
    partner: '体验设计部、统一身份认证组、协同办公部',
    riskLevel: '低',
    quality: '首屏资源按需加载，核心页面通过无障碍和主流浏览器兼容性检查。',
    remark: '当前处于需求评审和技术验证阶段，优先确认微前端接入边界。',
    versions: [
      {
        id: 'PRJ-DB-005-V010',
        version: 'V0.1.0',
        date: '-',
        content: '规划应用导航、统一待办和消息中心',
        status: '2',
        owner: '何宇辰',
      },
      {
        id: 'PRJ-DB-005-V020',
        version: 'V0.2.0',
        date: '-',
        content: '规划个性化布局和第三方应用接入能力',
        status: '2',
        owner: '何宇辰',
      },
    ],
  },
];

const detailFields: Array<keyof Project> = [
  'progress',
  'manHours',
  'budget',
  'teamSize',
  'goal',
  'technology',
  'partner',
  'riskLevel',
  'quality',
  'remark',
  'versions',
];

@Injectable()
export class ProjectInitializer implements OnModuleInit {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  async onModuleInit() {
    const existingProjects = await this.projectRepository.find();
    for (const seed of projectSeed) {
      const current = existingProjects.find((item) => item.id === seed.id);
      if (!current) {
        await this.projectRepository.save(seed);
        continue;
      }
      const missingDetails = Object.fromEntries(
        detailFields
          .filter((field) => {
            const value = current[field];
            return (
              value === null ||
              value === undefined ||
              value === '' ||
              value === 0 ||
              (Array.isArray(value) && value.length === 0)
            );
          })
          .map((field) => [field, seed[field]])
      );
      if (Object.keys(missingDetails).length) {
        await this.projectRepository.save({ ...current, ...missingDetails });
      }
    }
  }
}
