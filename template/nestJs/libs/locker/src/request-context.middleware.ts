import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LockRequestContextService } from './request-context.service';

@Injectable()
export class LockRequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    LockRequestContextService.run(() => {
      next();
    });
  }
}
