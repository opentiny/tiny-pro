import { Injectable } from "@nestjs/common";
import { RedisService } from "../../libs/redis/redis.service";
import { v7 } from "uuid";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AccessTokenPayload, RefreshTokenPayload } from "./entity/token";

export type TokenData = {
  accessToken: string;
  refreshToken: string;
  accessTokenPayload: AccessTokenPayload;
  refreshTokenPayload: RefreshTokenPayload;
  accessTokenTTL: number;
  refreshTokenTTL: number;
  accessTokenJTI: string;
  refreshTokenJTI: string;
};

@Injectable()
export class TokenService {
  constructor(
    private redisService: RedisService,
    private jwt: JwtService,
    private cfg: ConfigService
  ){}

  async revokeToken(token: string) {
    const {id:uid, jti, refreshTokenJti } = this.jwt.decode(token) as AccessTokenPayload;
    const redis = this.redisService.getRedis();
    await redis.del(`rt:${uid}:${refreshTokenJti}`)
    await redis.del(`at:${uid}:${jti}`)
    await redis.lrem(`user:${uid}:rt`, 0, refreshTokenJti)
    await redis.lrem(`user:${uid}:at`, 0, jti)
  }

  async revokeByUid(uid: number){
    const redis = this.redisService.getRedis();
    const userRTTotal = await redis.llen(`user:${uid}:rt`);
    const userATTotal = await redis.llen(`user:${uid}:at`);
    const userRTJTI = await redis.lrange(`user:${uid}:rt`, 0, userRTTotal);
    const userATJTI = await redis.lrange(`user:${uid}:at`, 0, userATTotal);
    const multi = redis.multi();
    if (userATJTI.length) {
      multi.del(`user:${uid}:at`)
    }
    if (userRTJTI.length) {
      multi.del(`user:${uid}:rt`)
    }
    for (const accessTokenJTI of userATJTI) {
      multi.del(`at:${uid}:${accessTokenJTI}`);
    }
    for (const refreshTokenJTI of userRTJTI) {
      multi.del(`rt:${uid}:${refreshTokenJTI}`);
    }
    await multi.exec();
  }

  createToken(id: number, email: string): TokenData{
    const accessTokenTTLSeconds = this.cfg.get('REDIS_SECONDS') ?? 7200;
    const refreshTokenTTL = this.cfg.get('REFRESH_TOKEN_TTL');
    const accessTokenTTL = accessTokenTTLSeconds * 1000;
    const accessTokenJTI = v7();
    const refreshTokenJTI = v7();
    const accessTokenPayload: AccessTokenPayload = {
      jti: accessTokenJTI,
      id,
      email,
      issueAt: new Date().toLocaleDateString(),
      ttl: accessTokenTTL,
      refreshTokenJti: refreshTokenJTI
    };
    const accessToken = this.jwt.sign(accessTokenPayload);
    const refreshTokenPayload:RefreshTokenPayload = {
      jti: refreshTokenJTI,
      ttl: refreshTokenTTL,
      issueAt: new Date().toLocaleDateString(),
      id,
      email,
      accessTokenJti: accessTokenJTI
    }
    const refreshToken = this.jwt.sign(refreshTokenPayload);
    return {
      accessToken,
      refreshToken,
      accessTokenPayload,
      refreshTokenPayload,
      accessTokenTTL,
      refreshTokenTTL,
      accessTokenJTI,
      refreshTokenJTI
    }
  }

  // 获取最早登陆的Token
  async getLastToken(
    uid: number
  ): Promise<{accessToken: string, refreshToken: string} | null>{
    const redis = this.redisService.getRedis();
    const refreshTokenJTI = await redis.lindex(`user:${uid}:rt`, -1);
    if (!refreshTokenJTI) {
      return Promise.resolve(null);
    }
    const accessTokenJTI = await redis.lindex(`user:${uid}:at`, -1);
    if (!accessTokenJTI) {
      return Promise.resolve(null);
    }
    const accessToken = await redis.get(`at:${uid}:${accessTokenJTI}`);
    const refreshToken = await redis.get(`rt:${uid}:${refreshTokenJTI}`);
    return {accessToken, refreshToken}

  }
  async accessTokenAlive(
    token: string
  ){
    const redis = this.redisService.getRedis();
    const { jti, id } = this.jwt.decode<AccessTokenPayload>(token);
    return redis.exists(`at:${id}:${jti}`);
  }

  async issueToken(
    uid: number,
    token: TokenData
  ){
    const redis = this.redisService.getRedis();
    let userTokenCount = await this.getUserTokenCount(uid);
    const limit = Number.parseInt(this.cfg.get<string>('DEVICE_LIMIT'));
    if (limit > 0 && userTokenCount >= limit) {
      while (
        userTokenCount >= limit
      ) {
        const lastToken = await this.getLastToken(uid);
        if (lastToken) {
          await this.revokeToken(lastToken.accessToken)
          userTokenCount -= 1;
        }
      }
    }
    const multi = redis.multi();
    await multi
      .set(`rt:${uid}:${token.refreshTokenJTI}`,  token.refreshToken)
      .set(`at:${uid}:${token.accessTokenJTI}`, token.accessToken)
      .pexpire(`rt:${uid}:${token.refreshTokenJTI}`, token.refreshTokenTTL)
      .pexpire(`at:${uid}:${token.accessTokenJTI}`, token.accessTokenTTL)
      .lpush(`user:${uid}:rt`, token.refreshTokenJTI)
      .lpush(`user:${uid}:at`, token.accessTokenJTI)
      .exec();
  }
  async getUserTokenCount(
    userIdentifier: number
  ){
    const redis = this.redisService.getRedis();
    return redis.llen(`user:${userIdentifier}:rt`)
  }
}
