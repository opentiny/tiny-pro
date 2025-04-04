import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../libs/redis/redis.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { encry, User } from '@app/models';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';

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
      await service.kickOut('test@example.com');
      expect(redisService.delUserToken).toHaveBeenCalledWith('user:test@example.com:token');
    });
  });

  describe('logout', () => {
    it('should delete a token from Redis after verifying it', async () => {
      jest.spyOn(jwtService, 'verify').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(redisService, 'delUserToken').mockResolvedValue(true);
      await service.logout('test-token');
      expect(jwtService.verify).toHaveBeenCalledWith('test-token');
      expect(redisService.delUserToken).toHaveBeenCalledWith('user:test@example.com:token');
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

        email: 'test@example.com',
        password: encry('hashed-password', 'salt'),
        salt: 'salt',
      } as User)

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('test-token');
      jest.spyOn(redisService, 'setUserToken').mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'hashed-password' });
      expect(result).toEqual({ token: 'test-token' });
      expect(redisService.setUserToken).toHaveBeenCalledWith(
        'user:test@example.com:token',
        'test-token',
        parseInt(process.env.REDIS_SECONDS)
      );
    });
  });
});