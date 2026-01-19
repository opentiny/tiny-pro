import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@app/jwt';
import { RedisService } from '../../../libs/redis/redis.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { encry, User } from '@app/models';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { TokenService } from '../token.service';
import { ConfigService } from '@nestjs/config';

jest.mock('uuid', () => ({
  v7: jest.fn(() => 'mocked-uuid-v7'),
}));

describe('AuthService', () => {
  let service: AuthService;
  const userRepository = {
    findOne: jest.fn()
  };
  const jwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };
  const redisService = {
    getUserToken: jest.fn(),
    delUserToken: jest.fn(),
    setUserToken: jest.fn(),
  };
  const i18nService = {
    translate: jest.fn(),
  };
  const tokenService = {
    revokeToken: jest.fn(),
    revokeByUid: jest.fn(),
    createToken: jest.fn(),
    getLastToken: jest.fn(),
    accessTokenAlive: jest.fn(),
    issueToken: jest.fn(),
    getUserTokenCount: jest.fn(),
    getTokenByJti: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
        {
          provide: TokenService,
          useValue: tokenService
        },
        {
          provide: ConfigService,
          useValue:{
            get: jest.fn()
          }
        }
      ],
    }).compile();
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      lang: ''
    } as any)
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getToken', () => {
    it('should return a token from Redis', async () => {
      jest.spyOn(redisService, 'getUserToken').mockResolvedValue('test-token');
      const token = await service.getToken('123');
      expect(token).toBe('test-token');
      expect(redisService.getUserToken).toHaveBeenCalledWith('user:123:token');
    });
  });

  describe('kickOut', () => {
    it('should delete a token from Redis', async () => {
      jest.spyOn(redisService, 'delUserToken').mockResolvedValue(true);
      await service.kickOut(1);
      expect(tokenService.revokeByUid).toHaveBeenCalledWith(1);
    });
  });

  describe('logout', () => {
    it('should delete a token from Redis after verifying it', async () => {
      jest.spyOn(jwtService, 'verify').mockResolvedValue({
        payload: {
          email: 'test@example.com',
          id: 1,
          jti: 'test-jti',
        }
      });
      jest.spyOn(tokenService, 'getTokenByJti').mockResolvedValue('access-token');
      jest.spyOn(tokenService, 'revokeToken').mockResolvedValue(undefined);
      await service.logout('test-token');
      expect(jwtService.verify).toHaveBeenCalledWith('test-token');
      expect(tokenService.getTokenByJti).toHaveBeenCalledWith(1, 'test-jti', 'at');
      expect(tokenService.revokeToken).toHaveBeenCalledWith('access-token');
    });
  });

  describe('login', () => {
    it('should throw an exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null)
      jest.spyOn(i18nService, 'translate').mockReturnValue('User does not exist');

      await expect(
        service.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(HttpException);
      expect(i18nService.translate).toHaveBeenCalledWith('exception.auth.userNotExists', expect.any(Object));
    });

    it('should throw an exception if password is incorrect', async () => {
      userRepository.findOne.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashed-password',
        salt: 'salt',
      } as User)
      jest.spyOn(i18nService, 'translate').mockReturnValue('Password or email error');

      // jest.spyOn(global, 'encry').mockReturnValue('wrong-hash');
      await expect(
        service.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(HttpException);
      expect(i18nService.translate).toHaveBeenCalledWith('exception.auth.passwordOrEmailError', expect.any(Object));
    });

    it('should return a token if login is successful', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: encry('hashed-password', 'salt'),
        salt: 'salt',
      } as User)

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('test-token');
      jest.spyOn(redisService, 'setUserToken').mockResolvedValue(true);

      await service.login({ email: 'test@example.com', password: 'hashed-password' });
      expect(tokenService.createToken).toHaveBeenCalledWith(1, 'test@example.com');
    });
  });
});
