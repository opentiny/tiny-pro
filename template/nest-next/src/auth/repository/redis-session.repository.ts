import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { Redis as IRedis } from 'ioredis';
import { join } from 'path';

interface Redis extends IRedis {
  issueToken: (
    sessionId: string,
    sessionIssueAt: string,
    uid: string,
    accessTokenJti: string,
    accessToken: string,
    refreshToken: string,
    refreshTokenJti: string,
    accessTokenTTL: string,
    refreshTokenTTL: string,
    sessionLimit: string,
  ) => Promise<void>;
  refreshToken: (
    uid: string,
    newSessionId: string,
    sessionIssueAt: string,
    oldSessionId: string,
    newAccessTokenJti: string,
    newRefreshTokenJti: string,
    newAccessToken: string,
    newRefreshToken: string,
    accessTokenTTL: string,
    refreshTokenTTL: string,
  ) => Promise<void>;
  revokeSession: (uid: string, sessionId: string) => Promise<void>;
  revokeAllSession: (uid: string) => Promise<void>;
}

@Injectable()
export class RedisSessionRepository {
  constructor(private readonly redisSrv: RedisService) {
    const redis = this.redisSrv.getOrThrow();
    redis.defineCommand('issueToken', {
      lua: readFileSync(join(__dirname, './lua/issue-token.lua')).toString(),
      numberOfKeys: 0,
    });
    redis.defineCommand('refreshToken', {
      lua: readFileSync(join(__dirname, './lua/refresh-token.lua')).toString(),
      numberOfKeys: 0,
    });
    redis.defineCommand('revokeSession', {
      lua: readFileSync(join(__dirname, './lua/revoke-session.lua')).toString(),
      numberOfKeys: 0,
    });
    redis.defineCommand('revokeAllSession', {
      lua: readFileSync(
        join(__dirname, './lua/revoke-all-session.lua'),
      ).toString(),
      numberOfKeys: 0,
    });
  }
  issueToken(
    sessionId: string,
    sessionIssueAt: string,
    uid: string,
    accessTokenJti: string,
    accessToken: string,
    refreshToken: string,
    refreshTokenJti: string,
    accessTokenTTL: string,
    refreshTokenTTL: string,
    sessionLimit: string,
  ) {
    const redis = this.redisSrv.getOrThrow() as Redis;
    return redis.issueToken(
      sessionId,
      sessionIssueAt,
      uid,
      accessTokenJti,
      accessToken,
      refreshToken,
      refreshTokenJti,
      accessTokenTTL,
      refreshTokenTTL,
      sessionLimit,
    );
  }

  refreshToken(
    uid: string,
    newSessionId: string,
    sessionIssueAt: string,
    oldSessionId: string,
    newAccessTokenJti: string,
    newRefreshTokenJti: string,
    newAccessToken: string,
    newRefreshToken: string,
    accessTokenTTL: string,
    refreshTokenTTL: string,
  ) {
    const redis = this.redisSrv.getOrThrow() as Redis;
    return redis.refreshToken(
      uid,
      newSessionId,
      sessionIssueAt,
      oldSessionId,
      newAccessTokenJti,
      newRefreshTokenJti,
      newAccessToken,
      newRefreshToken,
      accessTokenTTL,
      refreshTokenTTL,
    );
  }

  revokeSession(uid: string, sessionId: string) {
    const redis = this.redisSrv.getOrThrow() as Redis;
    return redis.revokeSession(uid, sessionId);
  }
  revokeAllSession(uid: string) {
    const redis = this.redisSrv.getOrThrow() as Redis;
    return redis.revokeAllSession(uid);
  }
}
