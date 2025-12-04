import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../libs/redis/redis.service";
import { hostname } from "os";

@Injectable()
export class InstallLock {
  private readonly LOCK_KEY = 'LOCK:INSTALL';
  private lockValue: string | null = null;

  constructor(private redisService: RedisService) {}

  async lock(seconds: number = 300): Promise<boolean> {
    const redis = this.redisService.getRedis();

    // 锁值就是持有者标识
    this.lockValue = `${hostname()}:${process.pid}:${Date.now()}`;

    const result = await redis.set(
      this.LOCK_KEY,
      this.lockValue,
      'EX', seconds,
      'NX'
    );

    return result === 'OK';
  }

  async release(): Promise<boolean> {
    if (!this.lockValue) return true;

    const redis = this.redisService.getRedis();

    // 只释放自己的锁
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      end
      return 0
    `;

    const result = await redis.eval(script, 1, this.LOCK_KEY, this.lockValue);
    this.lockValue = null;
    return result === 1;
  }

  async exist(): Promise<boolean> {
    const redis = this.redisService.getRedis();
    return redis.exists(this.LOCK_KEY).then(Boolean);
  }

  async wait(retry: number): Promise<boolean> {
    const redis = this.redisService.getRedis();

    for (let i = 1; i <= retry; i++) {
      if (!await this.exist()) return true;

      const holder = await redis.get(this.LOCK_KEY);
      Logger.warn(`[Lock] Retry ${i}/${retry}, held by: ${holder}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * i));
    }

    return false;
  }

  /**
   * 为锁续期, 防止意外过期.
   * @param seconds 为锁重新设置 seconds 秒后过期.
   * @returns
   */
  async extend(seconds: number = 300): Promise<boolean> {
    if (!this.lockValue) {
      Logger.warn('[Lock] No lock to extend');
      return false;
    }

    const redis = this.redisService.getRedis();

    // Lua脚本：验证持有者后延长过期时间
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;

    const result = await redis.eval(
      script,
      1,
      this.LOCK_KEY,
      this.lockValue,
      seconds.toString()
    ) as number;

    if (result === 1) {
      Logger.log(`[Lock] Extended by ${this.lockValue} for ${seconds}s`);
      return true;
    }

    Logger.warn(
      `[Lock] Extend failed, lock may have expired or been taken by another instance`
    );
    return false;
  }
}
