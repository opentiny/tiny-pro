import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisSessionRepository } from './repository/redis-session.repository';
import {
  IssueApiTokenService,
  IssueTokenSerivce,
  RevokeApiTokenService,
  RevokeTokenService,
} from './commands';
import {
  FindUserForAuthenticationQueryHandler,
  GetAllApiTokensService,
  GetApiTokenService,
  GetTokenDataService,
} from './queries';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../user';
import { GetTokenService } from './queries/get-token';
import { TokenRepository } from './repository/token.repository';
import { ApiTokenService } from './api-token.service';
import { RefreshTokenService } from './commands/refresh-token.command';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    AuthService,
    ApiTokenService,
    RedisSessionRepository,
    TokenRepository,
    IssueApiTokenService,
    IssueTokenSerivce,
    RevokeApiTokenService,
    RevokeTokenService,
    GetAllApiTokensService,
    GetTokenDataService,
    FindUserForAuthenticationQueryHandler,
    GetTokenService,
    RevokeTokenService,
    GetApiTokenService,
    RefreshTokenService,
  ],
  exports: [AuthService, ApiTokenService],
})
export class AuthModule {}
