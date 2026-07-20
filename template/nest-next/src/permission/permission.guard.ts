import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSION_KEYS } from '@app/shared';
import { QueryBus } from '@nestjs/cqrs';
import { AccessTokenPayload, RefreshTokenPayload } from '../auth';
import { UserHasPermissionQuery } from './queries';
import { toUserId } from 'src/user/user.entity';
import { Forbidden } from './errors';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly qb: QueryBus,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    const req: Request = ctx.switchToHttp().getRequest();
    const requiredPermission = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEYS,
      [ctx.getClass(), ctx.getHandler()],
    );
    if (!requiredPermission || requiredPermission.length === 0) {
      return true;
    }
    const user = req['user'] as AccessTokenPayload | RefreshTokenPayload;
    const uid = user.id;
    const isContainedPermission = await this.qb.execute(
      new UserHasPermissionQuery(requiredPermission, toUserId(uid)),
    );
    if (!isContainedPermission) {
      throw new Forbidden();
    }
    return true;
  }
}
