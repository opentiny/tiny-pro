import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext } from 'nestjs-i18n';
import { ConfigureService } from '@app/configure';
import { RejectRequest } from './errors/reject-request.error';

@Injectable()
export class RejectRequestGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cfg: ConfigureService
  ) {
  }
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (!this.cfg.get('feature.preview')) {
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
    throw new RejectRequest();
  }
}
