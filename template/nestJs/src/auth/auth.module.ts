import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/models';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RedisService } from '../../libs/redis/redis.service';
import { RedisModule } from '../../libs/redis/redis.module';
import { TokenService } from './token.service';
import { JwtModule as SelfJwtModule } from '@app/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RedisService, TokenService],
  exports: [AuthService, TokenService],
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    SelfJwtModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(cfg: ConfigService){
        return {
          secrect: cfg.get('AUTH_SECRET')
        }
      }
    }),
    JwtModule.registerAsync({
      imports: [RedisModule],
      useFactory: async () => ({
        secret: process.env.AUTH_SECRET,
        global: true,
        signOptions: {
          expiresIn: process.env.EXPIRES_IN,
        },
      }),
      global: true,
    }),
    UserModule
  ],
})
export class AuthModule {}
