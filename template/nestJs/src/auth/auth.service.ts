import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { encry, User } from '@app/models';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../libs/redis/redis.service';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TokenService } from './token.service';
import { AccessTokenPayload } from './entity/token';
import { pick } from '../../libs/utils/pick';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private user: Repository<User>,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly i18n: I18nService<I18nTranslations>,
    private tokenService: TokenService,
  ) {}

  async getToken(userId: string): Promise<string | null> {
    return this.redisService.getUserToken(`user:${userId}:token`);
  }

  async kickOut(id: number) {
    await this.tokenService.revokeByUid(id);
    // await this.redisService.delUserToken(`user:${email}:token`);
  }

  async logout(token: string): Promise<void> {
    //通过token解析email
    const decoded = this.jwtService.verify<AccessTokenPayload>(token);
    await this.tokenService.revokeByUid(decoded.id)
    //退出登录后，将token从Redis删除
    // await this.redisService.delUserToken(`user:${decoded.email}:token`);
    return;
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
    const token = this.tokenService.createToken(payload.id, payload.email);
    await this.tokenService.issueToken(payload.id, token);
    return pick(token, ['accessToken', 'accessTokenTTL', 'refreshToken', 'refreshTokenTTL'])
    // const token = this.jwtService.signAsync(payload);
    // //将token设置到Redis中，有效期2h
    // await this.redisService.setUserToken(
    //   `user:${email}:token`,
    //   await token,
    //   await parseInt(process.env.REDIS_SECONDS)
    // );
    // return {
    //   token: await token,
    // };
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
    const token = await this.jwtService.signAsync(payload);

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
