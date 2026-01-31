// libs/locker/src/request-context.service.ts
import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface RequestContext {
  requestId: string;
}

@Injectable()
export class LockRequestContextService {
  private static als = new AsyncLocalStorage<RequestContext>();

  static run<T>(callback: () => T): T {
    const context: RequestContext = {
      requestId: randomUUID(),
    };
    return this.als.run(context, callback);
  }

  static getRequestId(): string | undefined {
    return this.als.getStore()?.requestId;
  }

  static getContext(): RequestContext | undefined {
    return this.als.getStore();
  }
}
