import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, EntityTarget } from 'typeorm';
import { demoDataSeed } from './demo-data.seed';
import {
  BoardHome,
  BoardWorkPlan,
  BoardWorkPractice,
  BoardWorkPracticeChart,
  BoardWorkTraining,
  DemoJsonData,
  FormAdvance,
  FormBase,
  FormStep,
  ProfileDetail,
  UserInfo,
} from './entities/demo-data.entity';

const seedSources: Array<{
  entity: EntityTarget<DemoJsonData>;
  data: Record<string, unknown>;
}> = [
  { entity: BoardHome, data: demoDataSeed['board-home'] },
  { entity: BoardWorkPlan, data: demoDataSeed['work-data'] },
  { entity: BoardWorkPractice, data: demoDataSeed['work-practice'] },
  { entity: BoardWorkTraining, data: demoDataSeed['work-train'] },
  { entity: BoardWorkPracticeChart, data: demoDataSeed['work-select'] },
  { entity: UserInfo, data: demoDataSeed['user-center'] },
  { entity: FormBase, data: demoDataSeed['form-options'] },
  { entity: FormStep, data: demoDataSeed['form-options'] },
  { entity: FormAdvance, data: demoDataSeed['form-options'] },
  { entity: ProfileDetail, data: demoDataSeed['profile-detail'] },
];

@Injectable()
export class DemoDataInitializer implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    for (const { entity, data } of seedSources) {
      const repository = this.dataSource.getRepository(entity);
      if (await repository.findOne({ where: { id: 1 } })) {
        continue;
      }
      await repository.save({ id: 1, data });
    }
  }
}
