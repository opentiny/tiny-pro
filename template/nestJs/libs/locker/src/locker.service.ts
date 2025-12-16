import { Injectable, Logger, Scope } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { randomBytes } from 'crypto';
import { hostname } from 'os';

@Injectable({ scope: Scope.DEFAULT })
export class LockerService {
  private readonly logger = new Logger(LockerService.name);
  private readonly LOCK_PREFIX = 'lock:';
  private readonly DEFAULT_TTL = 30000; // 30秒默认超时
  private readonly RETRY_DELAY = 1000;   // 重试间隔
  private readonly MAX_RETRY = 20;       // 最大重试次数
  private readonly id = `${process.pid}-${hostname()}-${randomBytes(16).toString('hex')}`;

  constructor(private readonly redisService: RedisService) {}

  async acquire(key: string, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}${key}`;

    try {
      const result = await this.redisService.getRedis().set(
        lockKey,
        this.id,
        'PX',
        ttl,
        'NX' // Only set if key doesn't exist
      );

      return result === 'OK';
    } catch (error) {
      this.logger.error(`Failed to acquire lock for key ${key}: ${error.message}`);
      return false;
    }
  }

  async release(key: string): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}${key}`;
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await this.redisService.getRedis().eval(
        luaScript,
        1,
        lockKey,
        this.id
      );

      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to release lock for key ${key}: ${error.message}`);
      return false;
    }
  }

  async extend(key: string, ttl: number): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}${key}`;

      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("pexpire", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;

      try {
        const result = await this.redisService.getRedis().eval(
          luaScript,
          1,
          lockKey,
          this.id, // 使用固定的实例ID进行验证
          ttl.toString()
        );

        return result === 1;
      } catch (error) {
        this.logger.error(`Failed to extend lock for key ${key}: ${error.message}`);
        return false;
      }
  }

  async isLocked(key: string): Promise<boolean> {
    const lockKey = `${this.LOCK_PREFIX}${key}`;
    const result = await this.redisService.getRedis().exists(lockKey);
    return result === 1;
  }

  async acquireWithRetry(key: string, ttl?: number, maxRetries: number = this.MAX_RETRY): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const acquired = await this.acquire(key, ttl);
      if (acquired) {
        return true
      };

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
    }
    return false;
  }
}
