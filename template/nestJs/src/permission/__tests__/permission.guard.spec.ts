import { Test } from "@nestjs/testing"
import { PermissionGuard } from "../permission.guard"
import { Reflector } from "@nestjs/core"
import { UserService } from "../../user/user.service";
import { I18nContext } from "nestjs-i18n";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

describe('Permission Guard', ()=>{
  let guard: PermissionGuard;
  const ref = {
    getAllAndOverride: jest.fn()
  };
  const userService = {
    getUserPermission: jest.fn().mockResolvedValue([])
  }
  const i18n=  {
    lang: '',
    t: jest.fn()
  }
  beforeEach(async ()=>{
    const module = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        {
          provide: Reflector,
          useValue: ref
        },
        {
          provide: UserService,
          useValue: userService
        }
      ]
    }).compile();
    jest.spyOn(I18nContext, 'current').mockReturnValue(i18n as any);
    guard = module.get(PermissionGuard);
  })
  it('should allow access if no required permissions are defined', async () => {
    ref.getAllAndOverride.mockReturnValue([]);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          user: {},
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access if user has all required permissions', async () => {
    ref.getAllAndOverride.mockReturnValue(['read', 'write']);
    userService.getUserPermission.mockResolvedValue(['read', 'write']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token' },
          user: {},
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access if user has wildcard permission', async () => {
    ref.getAllAndOverride.mockReturnValue(['read', 'write']);
    userService.getUserPermission.mockResolvedValue(['*']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token' },
          user: {},
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access if user lacks required permissions', async () => {
    ref.getAllAndOverride.mockReturnValue(['read', 'write']);
    userService.getUserPermission.mockResolvedValue(['read']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token' },
          user: {},
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    await expect(guard.canActivate(context)).rejects.toThrowError(
      expect.objectContaining({
        status: HttpStatus.FORBIDDEN,
      }),
    );
  });
})