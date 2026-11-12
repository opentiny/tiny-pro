import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { demoDataSeed } from './demo-data.seed';
import { DemoData } from './entities/demo-data.entity';

@Injectable()
export class DemoDataInitializer implements OnModuleInit {
  constructor(
    @InjectRepository(DemoData)
    private readonly demoDataRepository: Repository<DemoData>
  ) {}

  async onModuleInit() {
    for (const [key, data] of Object.entries(demoDataSeed)) {
      if (await this.demoDataRepository.findOne({ where: { key } })) {
        continue;
      }
      await this.demoDataRepository.save({ key, data });
    }
  }
}
