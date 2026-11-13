import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const path = String(request.originalUrl ?? request.url ?? '');
    if (
      path.includes('/robot/chat/completions') ||
      path.endsWith('/healthCheck')
    ) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
          return { ...data, code: 200 };
        }
        return {
          data: data ?? null,
          errMsg: '',
          code: 200,
        };
      })
    );
  }
}
