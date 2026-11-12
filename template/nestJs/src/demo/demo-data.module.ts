import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoDataController } from './demo-data.controller';
import { DemoDataInitializer } from './demo-data.initializer';
import { DemoDataService } from './demo-data.service';
import {
  DemoData,
  FormSubmission,
} from './entities/demo-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DemoData, FormSubmission])],
  controllers: [DemoDataController],
  providers: [DemoDataService, DemoDataInitializer],
  exports: [DemoDataService],
})
export class DemoDataModule {}
