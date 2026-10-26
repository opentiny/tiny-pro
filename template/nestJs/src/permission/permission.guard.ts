import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { User } from '@app/models';
import { PERMISSION_KEYS } from '../public/permission.decorator';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext } from 'nestjs-i18n';

interface CustomReq extends Request {
  user: User;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private userSerivce: UserService) {}
  async canActivate(ctx: ExecutionContext) {
    // 传入 ctx 兜底：异步上下文丢失时从请求对象取回 i18nContext，避免 TypeError
    const i18n = I18nContext.current<I18nTranslations>(ctx);
    const req: CustomReq = ctx.switchToHttp().getRequest();
    const requiredPermission = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEYS,
      [ctx.getClass(), ctx.getHandler()]
    );
    if (!requiredPermission || requiredPermission.length === 0) {
      return true;
    }
    const [, token] = (req.headers.authorization ?? '').split(' ') ?? ['', ''];
    const permissionNames = await this.userSerivce.getUserPermission(
      token,
      req.user
    );
    const isContainedPermission = requiredPermission.every((item) =>
      permissionNames.includes(item)
    );
    if (permissionNames.includes('*')) {
      return true;
    }
    if (!isContainedPermission) {
      throw new HttpException(
        i18n?.t('exception.common.forbidden', {
          args: {
            permission: requiredPermission.join(','),
          },
        }) ?? 'Forbidden',
        HttpStatus.FORBIDDEN
      );
    }
    return true;
  }
}
