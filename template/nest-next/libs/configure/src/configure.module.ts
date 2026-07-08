import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loader } from './loader';
import { ConfigureService } from './configure.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loader],
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [ConfigureService],
  exports: [ConfigureService],
})
export class ConfigureModule {}
