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
import { ConfigureService } from '@app/configure';

@Injectable()
export class RejectRequestGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cfg: ConfigureService,
  ) {}
  canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (!this.cfg.get('feature.preview')) {
      return Promise.resolve(true);
    }
    const i18n = I18nContext.current<I18nTranslations>();
    const rejectRequest = this.reflector.getAllAndOverride<boolean>('reject', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!rejectRequest) {
      return Promise.resolve(true);
    }
    if (!i18n) {
      return Promise.resolve(false);
    }
    throw new HttpException(
      i18n.t('exception.preview.REJECT_THIS_REQUEST', {
        lang: I18nContext?.current()?.lang || 'enUS',
      }),
      HttpStatus.BAD_REQUEST,
    );
  }
}
