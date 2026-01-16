import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Permission, Role, User } from '@app/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { RedisService } from '../../libs/redis/redis.service';
import { TokenService } from '../auth/token.service';
import { UserInit } from './user.initalizer';

@Module({
  imports: [TypeOrmModule.forFeature([User, Permission, Role])],
  controllers: [UserController],
  providers: [UserService, AuthService, RedisService, TokenService, UserInit],
  exports: [UserService, UserInit],
})
export class UserModule {}
