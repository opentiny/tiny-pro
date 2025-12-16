import { LockerService } from './locker.service';
import { I18nTranslations } from '../../../src/.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { HttpException, HttpStatus } from '@nestjs/common';

export type WithLockOptions =  {
  key: string | ((args: any[]) => string);
  ttl?: number;
} & ({
  service: string;
  method: string;
} | {
  paramIndex?: number;
});

export function WithLock(options: WithLockOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const locker: LockerService = 'service' in options ? this[options.service] || this.locker : this.locker;
      const i18: I18nService<I18nTranslations> = this.i18nService || this.i18n;
      if (!locker) {
        throw new HttpException(i18.t('exception.common.internalError', {
            lang: I18nContext.current().lang,
        }), HttpStatus.INTERNAL_SERVER_ERROR)
      }

      let lockKey: string;
      if (typeof options.key === 'function') {
        lockKey = options.key(args);
      } else if ('paramIndex' in options && options.paramIndex !== undefined) {
        lockKey = `${options.key}:${args[options.paramIndex]}`;
      } else {
        lockKey = options.key;
      }

      const ttl = options.ttl || 30000;

      const acquired = await locker.acquireWithRetry(lockKey, ttl);
      if (!acquired) {
        throw new HttpException(i18.t('exception.common.timeout', {
          lang: I18nContext.current().lang,
        }), HttpStatus.REQUEST_TIMEOUT)
      }

      try {
        return await originalMethod.apply(this, args);
      } finally {
        await locker.release(lockKey);
      }
    };

    return descriptor;
  };
}
