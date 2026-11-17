import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Application } from '@app/models';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationInit } from './application.init';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationInit],
  exports: [ApplicationService, ApplicationInit],
})
export class ApplicationModule {}
