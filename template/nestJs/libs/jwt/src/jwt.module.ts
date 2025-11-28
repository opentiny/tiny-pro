import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { ConfigurableModuleClass } from './jwt.configure';

@Module({
  imports: [],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule extends ConfigurableModuleClass {}
