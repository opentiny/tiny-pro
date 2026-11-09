import { Module } from '@nestjs/common';
import { MockService } from './mock.service';
import { MockController } from './mock.controller';
import { FormDemoController } from './form-demo.controller';

@Module({
  controllers: [MockController, FormDemoController],
  providers: [MockService],
})
export class MockModule {}
