import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../auth.service';
import { I18nContext } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuthDto } from '../dto/create-auth.dto';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  const jwt = {
    verify: jest.fn(),
    decode: jest.fn(),
  }
  const reflector = {
    getAllAndOverride: jest.fn()
  };
  const authService = {
    getToken: jest.fn(),
    kickOut: jest.fn(),
    logout: jest.fn(),
    login: jest.fn()
  }
  const i18n=  {
    lang: '',
    t: jest.fn()
  }
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: jwt
        },
        {
          provide: Reflector,
          useValue: reflector
        },
        {
          provide: AuthService,
          useValue: authService
        }
      ]
    })
    .compile()
    jest.spyOn(I18nContext, 'current').mockReturnValue(i18n as any);
    authGuard = module.get(AuthGuard);
  })
  it('should return true, because is public', ()=>{
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(authGuard.canActivate({
      getHandler: jest.fn(),
      getClass: jest.fn()
    } as any));
    reflector.getAllAndOverride.mockReset();
  })
  it('should throw new HttpException, because token is empty, but isPub is false', ()=>{
    reflector.getAllAndOverride.mockReturnValue(false);
    const res = authGuard.canActivate({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp() {
        return {
          getRequest(){
            return {
              headers: {
                authorization: ''
              }
            }
          }
        }
      }
    } as any);
    expect(res).rejects.toThrow();
    expect(res).rejects.toThrow(HttpException);
  })
  it('should throw HttpException, becuase verify fail', ()=>{
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockRejectedValue('');
    const res = authGuard.canActivate({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp() {
        return {
          getRequest(){
            return {
              headers: {
                authorization: ''
              }
            }
          }
        }
      }
    } as any);
    expect(res).rejects.toThrow(HttpException);
  })
  it('should return true when isPublic is true', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const result = await authGuard.canActivate({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    } as any);
    expect(result).toBe(true);
    reflector.getAllAndOverride.mockReset();
  });

  it('should throw HttpException when token is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {
        authorization: '',
      },
    };
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(HttpException);
  });

  it('should throw HttpException when token verification fails', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockRejectedValue(new Error('Invalid token'));
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalidToken',
      },
    };
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(HttpException);
  });

  it('should throw HttpException when token is not in cache', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockResolvedValue({});
    jwt.decode.mockReturnValue({ email: 'test@example.com' });
    authService.getToken.mockResolvedValue(null);
    const mockRequest = {
      headers: {
        authorization: 'Bearer validToken',
      },
    };
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(HttpException);
  });

  it('should throw HttpException when token does not match cached token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockResolvedValue({});
    jwt.decode.mockReturnValue({ email: 'test@example.com' });
    authService.getToken.mockResolvedValue('differentToken');
    const mockRequest = {
      headers: {
        authorization: 'Bearer validToken',
      },
    };
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(HttpException);
  });

  it('should return true when token is valid and matches cached token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockResolvedValue({});
    jwt.decode.mockReturnValue({ email: 'test@example.com' });
    authService.getToken.mockResolvedValue('validToken');
    const mockRequest = {
      headers: {
        authorization: 'Bearer validToken',
      },
    };
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    const result = await authGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});