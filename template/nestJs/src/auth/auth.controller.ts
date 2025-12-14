import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LogoutAuthDto } from './dto/logout-auth.dto';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { RevokeApiTokenDto } from './dto/revoke-api-token.dto';
import { Public } from '../public/public.decorator';
import { AuthGuard } from './auth.guard';
import { RefreshToken } from './dto/refresh-token.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiToken, TokenPair } from './entity/token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '刷新令牌对',
    description: '刷新令牌对, 返回一个新的令牌对'
  })
  @ApiCreatedResponse({
    type: TokenPair,
  })
  @Public()
  @Post('/token/refresh')
  async refreshToken(
    @Body() body: RefreshToken
  ){
    return this.authService.refreshToken(body.token)
  }

  @ApiOperation({
    summary: '登录'
  })
  @ApiCreatedResponse({
    type: TokenPair,
  })
  @Public()
  @Post('login')
  @UseGuards(AuthGuard)
  async login(@Body() body: CreateAuthDto) {
    return this.authService.login(body);
  }

  @ApiOperation({
    summary: '登出'
  })
  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Body() body: LogoutAuthDto) {
    return this.authService.logout(body.token);
  }

  @ApiOperation({
    summary: '生成API Token',
    description: '用于外部系统调用'
  })
  @ApiCreatedResponse({
    type: ApiToken
  })
  // 生成API Token，用于外部系统调用
  @Public()
  @Post('api-token')
  async generateApiToken(@Body() body: CreateApiTokenDto) {
    return this.authService.generateApiToken(body, body.tokenName);
  }

  @ApiOperation({
    summary: '撤销API Token',
    description: '用于外部系统调用'
  })
  @Post('revoke-api-token')
  @UseGuards(AuthGuard)
  async revokeApiToken(@Body() body: RevokeApiTokenDto) {
    return this.authService.revokeApiToken(body.email, body.tokenId);
  }
}
