import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { encry, User } from '@app/models';
import { Repository } from 'typeorm';
import { RedisService } from '../../libs/redis/redis.service';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TokenService } from './token.service';
import { AccessTokenPayload, RefreshTokenPayload } from './entity/token';
import { pick } from '../../libs/utils/pick';
import { JwtService } from '@app/jwt';
import { ConfigService } from '@nestjs/config';
import { Configure } from 'src/config-schema';
import { WithLock } from '@app/locker/with-lock.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private user: Repository<User>,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly i18n: I18nService<I18nTranslations>,
    private tokenService: TokenService,
    private cfg: ConfigService<Configure, true>,
  ) {}

  async getToken(userId: string): Promise<string | null> {
    return this.redisService.getUserToken(`user:${userId}:token`);
  }

  async kickOut(id: number) {
    await this.tokenService.revokeByUid(id);
  }

  async logout(token: string): Promise<void> {
    const decoded = await this.jwtService.verify<AccessTokenPayload>(token);
    const {id,jti} = decoded.payload;
    const accessToken = await this.tokenService.getTokenByJti(id,jti,'at');
    if (accessToken) {
      await this.tokenService.revokeToken(accessToken)
    }
    return;
  }

  @WithLock({
    key(args) {
      let uid = 'unknown';
      try {
        const token = this.jwtService.decode(args[0]) as any;
        uid = token?.id;
      } catch {}
      return `user-token:${uid}`;
    }
  })
  async refreshToken(
    maybeToken: string
  ){
    const token = this.jwtService.decode<AccessTokenPayload | RefreshTokenPayload>(maybeToken);
    if ('refreshTokenJti' in token) {
      throw new HttpException(
        this.i18n.translate('exception.common.tokenError'),
        HttpStatus.BAD_REQUEST
      )
    }
    const refresTokenObject = token as RefreshTokenPayload;
    const {id, jti, accessTokenJti, email} = refresTokenObject;
    const refreshToken = await this.tokenService.getTokenByJti(id, jti,'rt');
    if (!refreshToken) {
      throw new HttpException(
        this.i18n.translate('exception.common.tokenExpire'),
        HttpStatus.UNAUTHORIZED
      )
    }
    const accessToken = await this.tokenService.getTokenByJti(id, accessTokenJti, 'at');
    if (accessToken){
      await this.tokenService.revokeToken(accessToken);
    }
    await this.tokenService.revokeRefreshToken(refreshToken);
    const tokenPair = await this.tokenService.createToken(id, email);
    // 颁发一个新的token
    // issueToken 内部会在颁发前踢出最老的会话, 也会删除过期的会话, 这里就不用调用 this.tokenService.revokeExpiredToken 了
    await this.tokenService.issueToken(id, tokenPair);
    // 返回一个新的TokenPair
    return pick(tokenPair, ['accessToken', 'accessTokenTTL', 'refreshToken', 'refreshTokenTTL'])
  }

  async login(dto: CreateAuthDto) {
    const { email, password } = dto;
    const userInfo = await this.user.findOne({ where: { email } });
    if (userInfo === null) {
      throw new HttpException(
        this.i18n.translate('exception.auth.userNotExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }

    if (encry(password, userInfo.salt) !== userInfo.password) {
      throw new HttpException(
        this.i18n.translate('exception.auth.passwordOrEmailError', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    const payload = {
      email,
      id: userInfo.id
    };
    const token = await this.tokenService.createToken(payload.id, payload.email);
    await this.tokenService.issueToken(payload.id, token);
    return pick(token, ['accessToken', 'accessTokenTTL', 'refreshToken', 'refreshTokenTTL'])
  }

  // 生成API Token，不覆盖原有登录token
  async generateApiToken(dto: CreateAuthDto, tokenName?: string) {
    const { email, password } = dto;
    const userInfo = await this.user.findOne({ where: { email } });
    if (userInfo === null) {
      throw new HttpException(
        this.i18n.translate('exception.auth.userNotExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }

    if (encry(password, userInfo.salt) !== userInfo.password) {
      throw new HttpException(
        this.i18n.translate('exception.auth.passwordOrEmailError', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }

    const payload = {
      email,
      type: 'api', // 标记为API token
    };
    const token = await this.jwtService.sign(payload, this.cfg.get('REDIS_SECONDS') * 1000);

    // 生成唯一的tokenId
    const tokenId =
      tokenName ||
      `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 将API token设置到Redis中，有效期可以设置更长
    const ttl = parseInt(process.env.API_TOKEN_SECONDS) || 86400 * 7; // 默认7天
    await this.redisService.setApiToken(email, tokenId, token, ttl);

    return {
      token,
      tokenId,
      expiresIn: ttl,
    };
  }

  // 验证API Token
  async validateApiToken(email: string, token: string): Promise<boolean> {
    const apiTokens = await this.redisService.getAllApiTokens(email);
    return apiTokens.includes(token);
  }

  // 撤销API Token
  async revokeApiToken(email: string, tokenId: string): Promise<void> {
    await this.redisService.delApiToken(email, tokenId);
  }
}
