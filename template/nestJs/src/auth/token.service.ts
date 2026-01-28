import { Injectable } from "@nestjs/common";
import { RedisService } from "../../libs/redis/redis.service";
import { v4 } from "uuid";
import { JwtService } from "@app/jwt";
import { ConfigService } from "@nestjs/config";
import { AccessTokenPayload, RefreshTokenPayload } from "./entity/token";
import { LockerService } from "@app/locker";
import { WithLock } from "@app/locker/with-lock.decorator";
import { I18nTranslations } from "../.generate/i18n.generated";
import { I18nService } from "nestjs-i18n";

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
    private cfg: ConfigService,
  ){}

  @WithLock({
    key(args){
      const {id} = this.jwt.decode(args[0]) as AccessTokenPayload;
      return `user-token:${id}`
    }
  })
  async revokeToken(token: string) {
    const {id:uid, jti, refreshTokenJti } = this.jwt.decode<AccessTokenPayload>(token);
    const redis = this.redisService.getRedis();
    await redis.del(`rt:${uid}:${refreshTokenJti}`)
    await redis.del(`at:${uid}:${jti}`)
    await redis.lrem(`user:${uid}:rt`, 0, refreshTokenJti)
    await redis.lrem(`user:${uid}:at`, 0, jti)
  }

  @WithLock({
    key(args){
      const {id} = this.jwt.decode(args[0]) as AccessTokenPayload;
      return `user-token:${id}`
    }
  })
  async revokeRefreshToken(refreshToken: string) {
    const {id:uid, jti} = this.jwt.decode<RefreshTokenPayload>(refreshToken);
    const redis = this.redisService.getRedis();
    const multi = redis.multi();
    multi.del(`rt:${uid}:${jti}`);
    multi.lrem(`user:${uid}:rt`, 0, jti);
    await multi.exec();
  }

  @WithLock({
    key(args){
      return `user-token:${args[0]}`
    }
  })
  private async revokeExpiredToken(uid: number){
    const redis = this.redisService.getRedis();

    const allRefreshTokenJti = await redis.lrange(`user:${uid}:rt`, 0, -1);
    const allAccessTokenJti = await redis.lrange(`user:${uid}:at`, 0, -1);
    const expiredRefreshTokenJti = [];
    const expiredAccessTokenJti = [];
    for (const refreshTokenJti of allRefreshTokenJti) {
      if (await redis.exists(`rt:${uid}:${refreshTokenJti}`)) {
        continue;
      }
      expiredRefreshTokenJti.push(refreshTokenJti);
    }
    for (const accessTokenJti of allAccessTokenJti) {
      if (await redis.exists(`at:${uid}:${accessTokenJti}`)) {
        continue;
      }
      expiredAccessTokenJti.push(accessTokenJti);
    }
    for (const accessJti of expiredAccessTokenJti) {
      await redis.lrem(`user:${uid}:at`, 0, accessJti);
    }
    for (const refresJti of expiredRefreshTokenJti) {
      await redis.lrem(`user:${uid}:rt`, 0, refresJti);
    }
  }

  @WithLock({
    key(args){
      return `user-token:${args[0]}`
    }
  })
  async revokeByUid(uid: number){
    const redis = this.redisService.getRedis();
    const userRTJTI = await redis.lrange(`user:${uid}:rt`, 0, -1);
    const userATJTI = await redis.lrange(`user:${uid}:at`, 0, -1);
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

  async createToken(id: number, email: string): Promise<TokenData>{
    const accessTokenTTLSeconds = this.cfg.get('REDIS_SECONDS') ?? 7200;
    const refreshTokenTTL = this.cfg.get('REFRESH_TOKEN_TTL') // ms;
    const accessTokenTTL = accessTokenTTLSeconds * 1000;
    const accessTokenJTI = v4();
    const refreshTokenJTI = v4();
    const accessTokenPayload: AccessTokenPayload = {
      jti: accessTokenJTI,
      id,
      email,
      issueAt: new Date().toLocaleDateString(),
      ttl: accessTokenTTL,
      refreshTokenJti: refreshTokenJTI
    };
    const accessToken = await this.jwt.sign(
      accessTokenPayload,
      accessTokenTTL
    );
    const refreshTokenPayload:RefreshTokenPayload = {
      jti: refreshTokenJTI,
      ttl: refreshTokenTTL,
      issueAt: new Date().toLocaleDateString(),
      id,
      email,
      accessTokenJti: accessTokenJTI
    }
    const refreshToken = await this.jwt.sign(refreshTokenPayload, refreshTokenTTL);
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

  @WithLock({
    key(args){
      return `user-token:${args[0]}`
    }
  })
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

  // O(N) 的时间复杂度我想应该是可以被接受的.
  // 这里被AuthGuard调用, 是一个热点路径, exists的复杂度是O(N), N 是传入的键个数.
  // 我们之传入了一个所以是O(1), 速度极快不需要加锁了
  async accessTokenAlive(
    token: string
  ){
    const redis = this.redisService.getRedis();
    const { jti, id } = this.jwt.decode<AccessTokenPayload>(token);
    return redis.exists(`at:${id}:${jti}`);
  }

  @WithLock({
    key(args){
      return `user-token:${args[0]}`
    }
  })
  async issueToken(
    uid: number,
    token: TokenData
  ){
    const redis = this.redisService.getRedis();
    let userTokenCount = await this.getUserTokenCount(uid);
    const limit = Number.parseInt(this.cfg.get<string>('DEVICE_LIMIT'));
    if (limit > 0 && userTokenCount >= limit) {
      // 先尝试吊销所有过期的Token (无法通过jti找到token都被视作过期的token)
      await this.revokeExpiredToken(uid);
      while (
        userTokenCount >= limit
      ) {
        const lastToken = await this.getLastToken(uid);
        if (!lastToken) {
          break;
        }
        await this.revokeToken(lastToken.accessToken)
        userTokenCount -= 1;
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
  @WithLock({
    key(args){
      return `user-token:${args[0]}`
    }
  })
  async getUserTokenCount(
    userIdentifier: number
  ){
    const redis = this.redisService.getRedis();
    return redis.llen(`user:${userIdentifier}:rt`)
  }
  @WithLock({
    key(args){
      return `user-token:${args[0]}`
    }
  })
  async getTokenByJti(
    id: number,
    jti: string,
    type: 'at' | 'rt'
  ) {
    const redis = this.redisService.getRedis();
    return redis.get(`${type}:${id}:${jti}`);
  }
}
