import { Module } from '@nestjs/common';
import { LockerService } from './locker.service';
import { ConfigurableModuleClass } from './locker.options';
import { RedisService } from '../../redis/redis.service';

@Module({
  providers: [LockerService, RedisService],
  exports: [LockerService],
})
export class LockerModule extends ConfigurableModuleClass {}
