import { Module } from '@nestjs/common';
import { MockService } from './mock.service';
import { MockController } from './mock.controller';

@Module({
  controllers: [MockController],
  providers: [MockService],
})
export class MockModule {}
