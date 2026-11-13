import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EditorCollaborationDocument,
  EditorDocument,
} from './entities/editor.entity';

const documentSeed = [
  {
    name: '云平台数据库联调记录',
    department: '云平台部',
    time: '2026-11-03 09:40:00',
    content: '<h2>云平台数据库联调记录</h2><p>本次联调完成了员工、项目和文档接口的数据库持久化验证。</p><ul><li>所有列表均读取 MySQL</li><li>新增与修改操作重启后保留</li></ul>',
  },
  {
    name: '企业工作台验收清单',
    department: '前端技术部',
    time: '2026-11-05 15:20:00',
    content: '<h2>企业工作台验收清单</h2><ol><li>检查监控页空数据状态</li><li>检查表格筛选与分页</li><li>检查编辑器自动保存</li></ol>',
  },
  {
    name: '质量网关发布说明',
    department: '质量保障部',
    time: '2026-11-08 18:10:00',
    content: '<h2>质量网关 V1.6</h2><p>新增接口覆盖率看板与发布前自动巡检能力。</p>',
  },
];

const collaborationSeed = [
  {
    name: '云资源平台迭代协同稿',
    members: ['周明轩', '何宇辰', '许文静'],
    time: '2026-11-06 10:15:00',
    content: '<h2>云资源平台迭代</h2><p>请各负责人每日更新接口联调和数据准备进展。</p>',
  },
  {
    name: '设计资产中心评审纪要',
    members: ['林佳怡', '苏婉清'],
    time: '2026-11-07 14:50:00',
    content: '<h2>评审结论</h2><p>统一资产分类与检索字段，下一版本补充批量管理能力。</p>',
  },
  {
    name: '质量门禁接入方案',
    members: ['黄志强', '周明轩'],
    time: '2026-11-09 11:30:00',
    content: '<h2>接入方案</h2><p>先覆盖核心读写接口，再逐步接入全量页面巡检。</p>',
  },
];

@Injectable()
export class EditorInitializer implements OnModuleInit {
  constructor(
    @InjectRepository(EditorDocument)
    private readonly documentRepository: Repository<EditorDocument>,
    @InjectRepository(EditorCollaborationDocument)
    private readonly collaborationRepository: Repository<EditorCollaborationDocument>
  ) {}

  async onModuleInit() {
    if ((await this.documentRepository.count()) === 0) {
      await this.documentRepository.save(documentSeed);
    }
    if ((await this.collaborationRepository.count()) === 0) {
      await this.collaborationRepository.save(collaborationSeed);
    }
  }
}
