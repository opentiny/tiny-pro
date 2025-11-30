import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;
  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }
  getRedis(){
    return this.redisClient;
  }
  async setUserToken(
    email: string,
    token: string,
    ttl: number
  ): Promise<string | null> {
    return this.redisClient.set(`user:${email}:token`, token, 'EX', ttl);
  }

  async getUserToken(email: string): Promise<string | null> {
    return this.redisClient.get(`user:${email}:token`);
  }

  async delUserToken(email: string): Promise<void> {
    //退出登录后，将token从Redis删除
    await this.redisClient.del(`user:${email}:token`);
    return;
  }

  // API Token 相关方法
  async setApiToken(
    email: string,
    tokenId: string,
    token: string,
    ttl: number
  ): Promise<string | null> {
    return this.redisClient.set(
      `user:${email}:api:${tokenId}`,
      token,
      'EX',
      ttl
    );
  }

  async getApiToken(email: string, tokenId: string): Promise<string | null> {
    return this.redisClient.get(`user:${email}:api:${tokenId}`);
  }

  async getAllApiTokens(email: string): Promise<string[]> {
    const keys = await this.redisClient.keys(`user:${email}:api:*`);
    if (keys.length === 0) return [];
    return this.redisClient.mget(...keys);
  }

  async delApiToken(email: string, tokenId: string): Promise<void> {
    await this.redisClient.del(`user:${email}:api:${tokenId}`);
    return;
  }

  async delAllApiTokens(email: string): Promise<void> {
    const keys = await this.redisClient.keys(`user:${email}:api:*`);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
    return;
  }
}
