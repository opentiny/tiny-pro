import { LockerService } from './locker.service';
import { I18nTranslations } from '../../../src/.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LockerDiscover } from './locker.discover';
import { LockRequestContextService } from './request-context.service';

export type WithLockOptions = {
  key: string | ((args: any[], context?: any) => string);
  ttl?: number;
  autoRenew?: boolean;
};

export function WithLock(options: WithLockOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const locker = LockerDiscover.get(LockerService);
      const i18n = LockerDiscover.get<I18nService<I18nTranslations>>(I18nService);

      // 生成锁 key
      let lockKey: string;
      if (typeof options.key === 'function') {
        lockKey = options.key.call(this, args, this);
      } else {
        lockKey = options.key;
      }

      const ttl = options.ttl || 30000;

      // 获取请求ID（用于可重入锁）
      const requestId = LockRequestContextService.getRequestId();

      let releaseLock: (() => Promise<void>) | null = null;

      try {
        if (options.autoRenew) {
          // 使用自动续期的锁
          releaseLock = await locker.acquireWithAutoRenew(lockKey, ttl, 100, requestId);
        } else {
          // 普通锁
          const acquired = await locker.acquireWithRetry(lockKey, ttl, 100, requestId);
          if (!acquired) {
            const lang = I18nContext.current()?.lang || 'en';
            throw new HttpException(
              i18n?.t('exception.common.timeout', { lang }) || 'Request timeout',
              HttpStatus.REQUEST_TIMEOUT
            );
          }
          releaseLock = async () => {
            await locker.release(lockKey, requestId);
          };
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        const lang = I18nContext.current()?.lang || 'en';
        throw new HttpException(
          i18n?.t('exception.common.timeout', { lang }) || 'Request timeout',
          HttpStatus.REQUEST_TIMEOUT
        );
      }

      try {
        return await originalMethod.apply(this, args);
      } finally {
        if (releaseLock) {
          await releaseLock();
        }
      }
    };

    return descriptor;
  };
}
