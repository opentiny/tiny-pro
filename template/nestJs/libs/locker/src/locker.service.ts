import { Injectable, Logger, Scope } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { randomBytes } from 'crypto';
import { hostname } from 'os';

@Injectable({ scope: Scope.DEFAULT })
export class LockerService {
  private readonly logger = new Logger(LockerService.name);

  private readonly LOCK_PREFIX = 'lock:';
  private readonly LOCK_COUNT_SUFFIX = ':count';
  private readonly DEFAULT_TTL = 30000;
  private readonly RETRY_DELAY = 100;
  private readonly MAX_RETRY = 100;

  private readonly processId = `${process.pid}-${hostname()}-${randomBytes(16).toString('hex')}`;

  constructor(private readonly redisService: RedisService) {}

  private getLockKeys(key: string): { lockKey: string; countKey: string } {
    const baseKey = `${this.LOCK_PREFIX}{${key}}`;
    return {
      lockKey: baseKey,
      countKey: `${baseKey}${this.LOCK_COUNT_SUFFIX}`,
    };
  }

  async acquire(key: string, ttl: number = this.DEFAULT_TTL, requestId?: string): Promise<boolean> {
    const redis = this.redisService.getRedis();
    const { lockKey, countKey } = this.getLockKeys(key);
    const fullId = this.getFullId(requestId);

    const luaScript = `
      local lockKey = KEYS[1]
      local countKey = KEYS[2]
      local fullId = ARGV[1]
      local ttl = tonumber(ARGV[2])

      local currentHolder = redis.call('GET', lockKey)

      if currentHolder == fullId then
        local count = redis.call('HINCRBY', countKey, fullId, 1)
        redis.call('PEXPIRE', lockKey, ttl)
        redis.call('PEXPIRE', countKey, ttl)
        return count
      elseif currentHolder == false then
        redis.call('SET', lockKey, fullId, 'PX', ttl)
        redis.call('HSET', countKey, fullId, 1)
        redis.call('PEXPIRE', countKey, ttl)
        return 1
      else
        return 0
      end
    `;

    try {
      const result = (await redis.eval(
        luaScript,
        2,
        lockKey,
        countKey,
        fullId,
        ttl.toString(),
      )) as number;

      if (result > 0) {
        this.logger.debug(`Lock acquired/reentered [${key}], requestId: ${requestId}, count: ${result}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Acquire lock error [${key}]: ${error.message}`);
      return false;
    }
  }

  async release(key: string, requestId?: string, ttl?: number): Promise<boolean> {
    const redis = this.redisService.getRedis();
    const { lockKey, countKey } = this.getLockKeys(key);
    const fullId = this.getFullId(requestId);
    const actualTtl = ttl || this.DEFAULT_TTL;

    // ✅ 修复：更安全的 countKey 删除逻辑
    const luaScript = `
      local lockKey = KEYS[1]
      local countKey = KEYS[2]
      local fullId = ARGV[1]
      local ttl = tonumber(ARGV[2])

      if redis.call('GET', lockKey) ~= fullId then
        return 0
      end

      local count = redis.call('HINCRBY', countKey, fullId, -1)

      if count <= 0 then
        redis.call('DEL', lockKey)
        redis.call('HDEL', countKey, fullId)
        if redis.call('HLEN', countKey) == 0 then
          redis.call('DEL', countKey)
        end
        return 1
      else
        redis.call('PEXPIRE', lockKey, ttl)
        redis.call('PEXPIRE', countKey, ttl)
        return 2
      end
    `;

    try {
      const result = (await redis.eval(
        luaScript,
        2,
        lockKey,
        countKey,
        fullId,
        actualTtl.toString(),
      )) as number;

      if (result === 0) {
        this.logger.warn(`Release failed: Not holder of [${key}], requestId: ${requestId}`);
        return false;
      } else if (result === 1) {
        this.logger.debug(`Lock fully released [${key}], requestId: ${requestId}`);
      } else {
        this.logger.debug(`Lock reentry decreased [${key}], requestId: ${requestId}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`Release lock error [${key}]: ${error.message}`);
      return false;
    }
  }

  // ✅ 修复：添加耗时监控和动态调整
  async acquireWithAutoRenew(
    key: string,
    ttl: number = this.DEFAULT_TTL,
    maxRetries: number = this.MAX_RETRY,
    requestId?: string,
  ): Promise<() => Promise<void>> {
    const acquired = await this.acquireWithRetry(key, ttl, maxRetries, requestId);

    if (!acquired) {
      throw new Error(`Failed to acquire lock for [${key}] after ${maxRetries} retries`);
    }

    let isRenewing = true;
    let consecutiveFailures = 0;
    let lastRenewalDuration = 0;
    let totalRenewals = 0;
    const maxConsecutiveFailures = 3;

    const scheduleNextRenewal = () => {
      if (!isRenewing) return;

      // ✅ 修复：动态调整续期间隔
      const baseInterval = ttl / 3;
      const adjustedInterval = Math.max(
        baseInterval - lastRenewalDuration * 1.5,
        ttl / 10,
      );

      setTimeout(async () => {
        if (!isRenewing) return;

        const startTime = Date.now();

        try {
          const extended = await this.extend(key, ttl, requestId);
          const duration = Date.now() - startTime;
          lastRenewalDuration = duration;

          if (extended) {
            consecutiveFailures = 0;
            totalRenewals++;

            // ✅ 添加：监控续期耗时
            const percentage = (duration / ttl * 100).toFixed(1);
            if (duration > ttl / 4) {
              this.logger.warn(
                `Slow renewal for [${key}]: ${duration}ms (${percentage}% of TTL)`
              );
            } else {
              this.logger.debug(
                `Renewed [${key}], duration: ${duration}ms, total: ${totalRenewals}`
              );
            }

            scheduleNextRenewal();
          } else {
            throw new Error('Lock lost during renewal');
          }
        } catch (error) {
          consecutiveFailures++;
          this.logger.error(
            `Renewal error for [${key}]: ${error.message}, ` +
            `failures: ${consecutiveFailures}/${maxConsecutiveFailures}`
          );

          if (consecutiveFailures >= maxConsecutiveFailures) {
            isRenewing = false;
            this.logger.error(
              `Auto-renewal stopped for [${key}] after ${consecutiveFailures} failures`
            );
          } else {
            scheduleNextRenewal();
          }
        }
      }, adjustedInterval);
    };

    scheduleNextRenewal();

    return async () => {
      isRenewing = false;
      this.logger.debug(
        `Releasing [${key}], ${totalRenewals} renewals, ${consecutiveFailures} failures`
      );
      await this.release(key, requestId, ttl);
    };
  }

  async acquireWithRetry(
    key: string,
    ttl: number = this.DEFAULT_TTL,
    maxRetries: number = this.MAX_RETRY,
    requestId?: string,
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      if (await this.acquire(key, ttl, requestId)) return true;
      await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
    }
    this.logger.warn(`Failed to acquire lock for [${key}] after ${maxRetries} retries`);
    return false;
  }

  async extend(key: string, ttl: number, requestId?: string): Promise<boolean> {
    const redis = this.redisService.getRedis();
    const { lockKey, countKey } = this.getLockKeys(key);
    const fullId = this.getFullId(requestId);

    const luaScript = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        redis.call('PEXPIRE', KEYS[1], ARGV[2])
        redis.call('PEXPIRE', KEYS[2], ARGV[2])
        return 1
      end
      return 0
    `;

    try {
      const result = await redis.eval(luaScript, 2, lockKey, countKey, fullId, ttl.toString());
      return result === 1;
    } catch (error) {
      this.logger.error(`Extend lock error [${key}]: ${error.message}`);
      return false;
    }
  }

  // ✅ 添加：辅助方法
  async isLocked(key: string): Promise<boolean> {
    const { lockKey } = this.getLockKeys(key);
    const result = await this.redisService.getRedis().exists(lockKey);
    return result === 1;
  }

  async getReentryCount(key: string, requestId?: string): Promise<number> {
    const redis = this.redisService.getRedis();
    const { countKey } = this.getLockKeys(key);
    const fullId = this.getFullId(requestId);

    const count = await redis.hget(countKey, fullId);
    return count ? parseInt(count) : 0;
  }

  private getFullId(requestId?: string): string {
    return requestId ? `${this.processId}:${requestId}` : this.processId;
  }
}
