import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@app/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../.generate/i18n.generated';
import { TokenService } from './token.service';
import { TokenPayload } from './entity/token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService
  ) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const i18n = I18nContext.current<I18nTranslations>();
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const req = ctx.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new HttpException(
        i18n.t('exception.common.tokenError', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.UNAUTHORIZED
      );
    }
    try {
      await this.jwt.verify(token);
      const payload = this.jwt.decode<TokenPayload>(token);
      req['user'] = payload;

      // 检查是否是API token
      if ('type' in payload && payload.type === 'api') {
        // 验证API token
        const isValidApiToken = await this.authService.validateApiToken(
          payload.email,
          token
        );
        if (!isValidApiToken) {
          throw new HttpException(
            i18n.t('exception.common.tokenExpire', {
              lang: I18nContext.current().lang,
            }),
            HttpStatus.UNAUTHORIZED
          );
        }
      } else {
        // 原有的登录token验证逻辑
        if (!await this.tokenService.accessTokenAlive(token)){
          throw new HttpException(
            i18n.t('exception.common.tokenExpire', {
              lang: I18nContext.current().lang,
            }),
            HttpStatus.UNAUTHORIZED
          );
        }
      }
      return true;
    } catch (err) {
      throw new HttpException(
        i18n.t('exception.common.tokenExpire', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.UNAUTHORIZED
      );
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
