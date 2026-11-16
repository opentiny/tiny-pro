import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoDataController } from './demo-data.controller';
import { DemoDataInitializer } from './demo-data.initializer';
import { DemoDataService } from './demo-data.service';
import {
  BoardHome,
  BoardWorkPlan,
  BoardWorkPractice,
  BoardWorkPracticeChart,
  BoardWorkTraining,
  FormAdvance,
  FormBase,
  FormStep,
  FormSubmission,
  ProfileDetail,
  UserInfo,
} from './entities/demo-data.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardHome,
      BoardWorkPlan,
      BoardWorkPractice,
      BoardWorkTraining,
      BoardWorkPracticeChart,
      UserInfo,
      FormBase,
      FormStep,
      FormAdvance,
      ProfileDetail,
      FormSubmission,
    ]),
  ],
  controllers: [DemoDataController],
  providers: [DemoDataService, DemoDataInitializer],
  exports: [DemoDataService],
})
export class DemoDataModule {}
