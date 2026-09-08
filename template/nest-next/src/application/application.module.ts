import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Application } from './application.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Application])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
