import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from './entity';
import { AuthService } from './auth.service';
import { ApiTokenService } from './api-token.service';
import { InvalidToken } from './errors';
import { DomainError } from '@app/shared';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly apiTokenService: ApiTokenService,
  ) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const token = this.extractToken(ctx);
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!token) {
      return false;
    }
    try {
      const payload = this.jwtService.verify<TokenPayload>(token);
      req['user'] = payload;
      if ('type' in payload && payload.type === 'api') {
        const isValidApiToken = await this.apiTokenService.validateApiToken(
          payload.email,
          token,
        );
        if (!isValidApiToken) {
          throw new InvalidToken();
        }
        return true;
      }
      await this.authService.tokenAlive(token);
      return true;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new InvalidToken();
    }
  }
  private extractToken(ctx: ExecutionContext): string {
    const request: Request = ctx.switchToHttp().getRequest();
    const authorization = request.headers.authorization || '';
    if (!authorization) {
      return '';
    }
    return authorization.split(' ')[1];
  }
}
