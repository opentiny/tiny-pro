import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateApiTokenDto,
  LoginDto,
  LogoutAuthDto,
  RefreshTokenDTO,
  RevokeApiTokenDto,
} from './dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiToken, TokenPair } from './entity';
import { ApiTokenService } from './api-token.service';
import { Public } from './deocrators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiTokenService: ApiTokenService,
  ) {}

  @ApiOperation({
    summary: '刷新令牌对',
    description: '刷新令牌对, 返回一个新的令牌对',
  })
  @ApiCreatedResponse({
    type: TokenPair,
  })
  @Public()
  @Post('/token/refresh')
  async refreshToken(@Body() body: RefreshTokenDTO) {
    return this.authService.refreshToken(body.token);
  }

  @ApiOperation({
    summary: '登录',
  })
  @ApiCreatedResponse({
    type: TokenPair,
  })
  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({
    summary: '登出',
  })
  @Post('logout')
  logout(@Body() body: LogoutAuthDto) {
    return this.authService.logout(body.token);
  }

  @ApiOperation({
    summary: '生成API Token',
    description: '用于外部系统调用',
  })
  @ApiCreatedResponse({
    type: ApiToken,
  })
  // 生成API Token，用于外部系统调用
  @Public()
  @Post('api-token')
  async generateApiToken(@Body() body: CreateApiTokenDto) {
    return this.apiTokenService.issueApiToken(body);
  }

  @ApiOperation({
    summary: '撤销API Token',
    description: '用于外部系统调用',
  })
  @Post('revoke-api-token')
  async revokeApiToken(@Body() body: RevokeApiTokenDto) {
    return this.apiTokenService.revokeApiToken(body.email, body.tokenId);
  }
}
