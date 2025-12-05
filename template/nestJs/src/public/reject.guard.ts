import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { Configure } from '../config-schema';

@Injectable()
export class RejectRequestGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cfg: ConfigService<Configure>
  ) {
  }
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (!this.cfg.get('PREVIEW_MODE')) {
      return true;
    }
    const i18n = I18nContext.current<I18nTranslations>();
    const rejectRequest = this.reflector.getAllAndOverride('reject', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!rejectRequest) {
      return true;
    }
    throw new HttpException(
      i18n.t('exception.preview.reject-this-request', {
        lang: I18nContext.current().lang,
      }),
      HttpStatus.BAD_REQUEST
    );
  }
}
