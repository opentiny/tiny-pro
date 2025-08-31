import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../../auth/auth.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { In, Like, Repository } from 'typeorm';
import { User, Role } from '@app/models';
import * as crypto from 'crypto';
import { paginate } from 'nestjs-typeorm-paginate';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let authService: AuthService;
  let i18nService: I18nService;

  const mockPaginateMethod = jest.fn()
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: AuthService,
          useValue: {
            kickOut: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn().mockReturnValue('translated message'),
          },
        },
      ],
    }).compile();

    jest.spyOn(I18nContext, 'current')
    .mockReturnValue({
      current: jest.fn().mockReturnValue({
        lang: ''
      })
    } as any)
    jest.mock('nestjs-typeorm-paginate', () => ({
      ...jest.requireActual('nestjs-typeorm-paginate'),
      paginate: mockPaginateMethod,
    }))
    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    authService = module.get<AuthService>(AuthService);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return existing user if isInit is true and user exists', async () => {
      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce({ id: 1 } as User);
      const result = await service.create({ email: 'test@example.com' } as any, true);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw an exception if user already exists', async () => {
      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce({ id: 1 } as User);
      await expect(service.create({ email: 'test@example.com' } as any, false)).rejects.toThrow(
        HttpException,
      );
    });

    it('should create and save a new user', async () => {
      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(null);
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce([]);
      jest.spyOn(userRepository, 'create').mockReturnValue({} as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({ id: 1 } as User);

      const result = await service.create({ email: 'test@example.com' } as any, false);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw an exception if saving user fails', async () => {
      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(null);
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce([]);
      jest.spyOn(userRepository, 'create').mockReturnValue({} as User);
      jest.spyOn(userRepository, 'save').mockRejectedValueOnce(new Error('Save failed'));

      await expect(service.create({ email: 'test@example.com' } as any, false)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user if more than one user exists', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([{ id: 1 }, { id: 2 }] as User[]);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ id: 1 } as User);
      jest.spyOn(userRepository, 'remove').mockResolvedValueOnce({} as User);

      const result = await service.deleteUser('test@example.com');
      expect(authService.kickOut).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeDefined();
    });

    it('should throw an exception if only one user exists', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([{ id: 1 }] as User[]);

      await expect(service.deleteUser('test@example.com')).rejects.toThrow(HttpException);
    });

    it('should do nothing if user does not exist', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([{ id: 1 }, { id: 2 }] as User[]);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.deleteUser('test@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('verifyPassword', () => {
    it('should return true if password matches', async () => {
      const password = 'password';
      const salt = 'salt';
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 18, 'sha256').toString('hex');

      const result = await service.verifyPassword(password, hash, salt);
      expect(result).toBe(true);
    });

    it('should return false if password does not match', async () => {
      const result = await service.verifyPassword('password', 'wrongHash', 'salt');
      expect(result).toBe(false);
    });
  });

  describe('updatePwdUser', () => {
    it('should update password if old password is correct', async () => {
      const user = { email: 'test@example.com', password: 'oldHash', salt: 'salt' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(service, 'verifyPassword').mockResolvedValueOnce(true);
      jest.spyOn(service, 'encry').mockResolvedValueOnce('newHash');
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(user);

      const result = await service.updatePwdUser({
        email: 'test@example.com',
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        token: 'token',
      });
      expect(authService.kickOut).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeUndefined();
    });

    it('should throw an exception if old password is incorrect', async () => {
      const user = { email: 'test@example.com', password: 'oldHash', salt: 'salt' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(service, 'verifyPassword').mockResolvedValueOnce(false);

      await expect(
        service.updatePwdUser({
          email: 'test@example.com',
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword',
          token: 'token',
        }),
      ).rejects.toThrow(HttpException);
    });
  });
  describe('getUserInfo', () => {
    it('should return user information with formatted dates if user exists', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        probationStart: new Date('2023-01-01'),
        probationEnd: new Date('2023-06-01'),
        protocolStart: new Date('2023-07-01'),
        protocolEnd: new Date('2023-12-01'),
        department: 'Engineering',
        employeeType: 'Full-time',
        address: '123 Test Street',
        status: 'Active',
      } as unknown as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'formatDateToDay').mockImplementation(async (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      });

      const result = await service.getUserInfo('test@example.com');
      expect(result).toEqual({
        ...mockUser,
        probationStart: '2023-01-01',
        probationEnd: '2023-06-01',
        protocolStart: '2023-07-01',
        protocolEnd: '2023-12-01',
      });
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.getUserInfo('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should call findOne with correct parameters', async () => {
      const email = 'test@example.com';
      const relations = ['role', 'role.permission'];

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await service.getUserInfo(email, relations);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: [
          'id',
          'name',
          'email',
          'department',
          'employeeType',
          'protocolStart',
          'protocolEnd',
          'probationEnd',
          'probationStart',
          'probationDuration',
          'address',
          'status',
        ],
        relations,
      });
    });

    it('should not format dates if they are null', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        probationStart: null,
        probationEnd: null,
        protocolStart: null,
        protocolEnd: null,
        department: 'Engineering',
        employeeType: 'Full-time',
        address: '123 Test Street',
        status: 'Active',
      } as unknown as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await service.getUserInfo('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });
  describe('getAllUser', () => {
    it('should return paginated user data with formatted dates', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          probationStart: new Date('2023-01-01'),
          probationEnd: new Date('2023-06-01'),
          protocolStart: new Date('2023-07-01'),
          protocolEnd: new Date('2023-12-01'),
          department: 'Engineering',
          employeeType: 'Full-time',
          address: '123 Test Street',
          status: 'Active',
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          probationStart: null,
          probationEnd: null,
          protocolStart: null,
          protocolEnd: null,
          department: 'HR',
          employeeType: 'Part-time',
          address: '456 Test Avenue',
          status: 'Inactive',
        },
      ];
      mockPaginateMethod.mockImplementationOnce(()=>{
        return Promise.resolve({items: mockUsers, meta: {}})
      })
      jest.spyOn(userRepository,'count').mockResolvedValue(2)
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([...mockUsers as any])
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValueOnce([mockUsers as any, 2]);
      jest.spyOn(service, 'formatDateToDay').mockImplementation(async (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      });

      const result = await service.getAllUser({ page: 1, limit: 10 });
      expect(result.items).toEqual([
        {
          ...mockUsers[0],
          probationStart: '2023-01-01',
          probationEnd: '2023-06-01',
          protocolStart: '2023-07-01',
          protocolEnd: '2023-12-01',
        },
        mockUsers[1],
      ]);
      expect(result.meta.totalItems).toBe(2);
    });

    it('should filter users by name, role, and email', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          department: 'Engineering',
          employeeType: 'Full-time',
          address: '123 Test Street',
          status: 'Active',
        },
      ];

      mockPaginateMethod.mockImplementationOnce(()=>{
        return Promise.resolve({items: mockUsers, meta: {}})
      })
      jest.spyOn(userRepository, 'count').mockResolvedValue(2)
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([...mockUsers as any])
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValueOnce([mockUsers, 1] as any);

      const result = await service.getAllUser(
        { page: 1, limit: 10 },
        'User 1',
        [1],
        'user1@example.com',
      );
      expect(result.items).toEqual(mockUsers);
      expect(result.meta.totalItems).toBe(2);
    });

    it('should handle empty results gracefully', async () => {
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValueOnce([[], 0]);
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([])
      mockPaginateMethod.mockImplementationOnce(()=>{
        return Promise.resolve({items: {}, meta: {}})
      })
      jest.spyOn(userRepository, 'count').mockResolvedValue(0)
      const result = await service.getAllUser({ page: 1, limit: 10 });
      expect(result.items).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });
  });
  describe('getUserPermission', () => {
    it('should return a list of unique permissions for the user', async () => {
      const mockUser = {
        email: 'test@example.com',
        role: [
          {
            permission: [
              { name: 'read' },
              { name: 'write' },
            ],
          },
          {
            permission: [
              { name: 'write' },
              { name: 'delete' },
            ],
          },
        ],
      } as unknown as User;

      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(mockUser);

      const result = await service.getUserPermission('token', mockUser);
      expect(result).toEqual(['read', 'write', 'delete']);
    });

    it('should return an empty array if the user has no roles or permissions', async () => {
      const mockUser = {
        email: 'test@example.com',
        role: [],
      } as unknown as User;

      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(mockUser);

      const result = await service.getUserPermission('token', mockUser);
      expect(result).toEqual([]);
    });

    it('should handle null user information gracefully', async () => {
      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(null);

      const result = await service.getUserPermission('token', {} as User);
      expect(result).toEqual([]);
    });

    it('should call getUserInfo with correct parameters', async () => {
      const mockUser = { email: 'test@example.com' } as User;
      const getUserInfoSpy = jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(null);

      await service.getUserPermission('token', mockUser);
      expect(getUserInfoSpy).toHaveBeenCalledWith('test@example.com', ['role', 'role.permission']);
    });
  });
  describe('updatePwdUser', () => {
    it('should update the password if the old password is correct', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'oldHash',
        salt: 'salt',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'verifyPassword').mockResolvedValueOnce(true);
      jest.spyOn(service, 'encry').mockResolvedValueOnce('newHash');
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(mockUser);

      const updatePwdUserDto = {
        email: 'test@example.com',
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        token: 'token',
      };

      const result = await service.updatePwdUser(updatePwdUserDto);

      expect(service.verifyPassword).toHaveBeenCalledWith(
        'oldPassword',
        'oldHash',
        'salt',
      );
      expect(service.encry).toHaveBeenCalledWith('newPassword', 'salt');
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: 'newHash',
      });
      expect(authService.kickOut).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeUndefined();
    });

    it('should throw an exception if the old password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'oldHash',
        salt: 'salt',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'verifyPassword').mockResolvedValueOnce(false);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(null);

      const updatePwdUserDto = {
        email: 'test@example.com',
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword',
        token: 'token',
      };

      await expect(service.updatePwdUser(updatePwdUserDto)).rejects.toThrow(
        HttpException,
      );

      expect(service.verifyPassword).toHaveBeenCalledWith(
        'wrongPassword',
        'oldHash',
        'salt',
      );
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(authService.kickOut).not.toHaveBeenCalled();
    });

    it('should throw an exception if the user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue(null)
      jest.spyOn(service, 'verifyPassword').mockResolvedValue(true)
      jest.spyOn(authService, 'kickOut').mockResolvedValue(null)

      const updatePwdUserDto = {
        email: 'nonexistent@example.com',
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        token: 'token',
      };

      await expect(service.updatePwdUser(updatePwdUserDto)).rejects.toThrow();

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        select: ['id', 'name', 'email', 'salt', 'password'],
      });
      expect(service.verifyPassword).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(authService.kickOut).not.toHaveBeenCalled();
    });
  });
  describe('updatePwdAdmin', () => {
    it('should update the password and kick out the user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'oldHash',
        salt: 'salt',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'encry').mockResolvedValueOnce('newHash');
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(mockUser);

      const updatePwdAdminDto = {
        email: 'test@example.com',
        newPassword: 'newPassword',
      };

      const result = await service.updatePwdAdmin(updatePwdAdminDto);

      expect(service.encry).toHaveBeenCalledWith('newPassword', 'salt');
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: 'newHash',
      });
      expect(authService.kickOut).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeUndefined();
    });

    it('should throw an exception if the user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository,'save').mockResolvedValue(null);

      const updatePwdAdminDto = {
        email: 'nonexistent@example.com',
        newPassword: 'newPassword',
      };

      await expect(service.updatePwdAdmin(updatePwdAdminDto)).rejects.toThrow();

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        select: ['id', 'name', 'email', 'salt', 'password'],
      });
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(authService.kickOut).not.toHaveBeenCalled();
    });
  });
  describe('updateUserInfo', () => {
    it('should update user information and kick out the user if roles are changed', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Old Name',
        department: 'Old Department',
        employeeType: 'Old Type',
        probationStart: new Date('2023-01-01'),
        probationEnd: new Date('2023-06-01'),
        probationDuration: 6,
        protocolStart: new Date('2023-07-01'),
        protocolEnd: new Date('2023-12-01'),
        address: 'Old Address',
        status: 'Inactive',
        role: [{ id: 1 }],
      } as unknown as User;

      const updatedRoles = [{ id: 2 }] as any;
      const updateUserDto: any = {
        email: 'test@example.com',
        name: 'New Name',
        department: 'New Department',
        employeeType: 'New Type',
        probationStart: new Date('2023-02-01'),
        probationEnd: new Date('2023-07-01'),
        probationDuration: 5,
        protocolStart: new Date('2023-08-01'),
        protocolEnd: new Date('2023-12-31'),
        address: 'New Address',
        status: 'Active',
        roleIds: [2],
      };

      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(mockUser);
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce(updatedRoles as any);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        ...mockUser,
        ...updateUserDto,
        role: updatedRoles,
      }) as any;
      jest.spyOn(authService, 'kickOut').mockResolvedValueOnce(undefined);

      const result = await service.updateUserInfo(updateUserDto as any);

      expect(service.getUserInfo).toHaveBeenCalledWith('test@example.com', ['role']);
      expect(roleRepository.find).toHaveBeenCalledWith({ where: { id: In([2]) } });
      expect(authService.kickOut).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        ...mockUser,
        ...updateUserDto,
        role: updatedRoles,
      });
    });

    it('should update user information without kicking out the user if roles are unchanged', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Old Name',
        department: 'Old Department',
        employeeType: 'Old Type',
        probationStart: new Date('2023-01-01'),
        probationEnd: new Date('2023-06-01'),
        probationDuration: 6,
        protocolStart: new Date('2023-07-01'),
        protocolEnd: new Date('2023-12-01'),
        address: 'Old Address',
        status: 'Inactive',
        role: [{ id: 1 }],
      } as unknown as User;

      const updateUserDto = {
        email: 'test@example.com',
        name: 'New Name',
        department: 'New Department',
        employeeType: 'New Type',
        probationStart: new Date('2023-02-01'),
        probationEnd: new Date('2023-07-01'),
        probationDuration: 5,
        protocolStart: new Date('2023-08-01'),
        protocolEnd: new Date('2023-12-31'),
        address: 'New Address',
        status: 'Active',
        roleIds: [1],
      };

      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(mockUser);
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce(mockUser.role);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        ...mockUser,
        ...updateUserDto,
      } as any);

      const result = await service.updateUserInfo(updateUserDto as any);

      expect(service.getUserInfo).toHaveBeenCalledWith('test@example.com', ['role']);
      expect(roleRepository.find).toHaveBeenCalledWith({ where: { id: In([1]) } });
      expect(authService.kickOut).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUser,
        ...updateUserDto,
      });
    });

    it('should throw an exception if the user does not exist', async () => {
      const updateUserDto = {
        email: 'nonexistent@example.com',
        name: 'New Name',
        department: 'New Department',
        employeeType: 'New Type',
        probationStart: new Date('2023-02-01'),
        probationEnd: new Date('2023-07-01'),
        probationDuration: 5,
        protocolStart: new Date('2023-08-01'),
        protocolEnd: new Date('2023-12-31'),
        address: 'New Address',
        status: 'Active',
        roleIds: [1],
      };

      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(null);
      jest.spyOn(authService, 'kickOut').mockResolvedValueOnce(null);
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce(null);
      jest.spyOn(service, 'getUserInfo').mockResolvedValueOnce(null);

      await expect(service.updateUserInfo(updateUserDto as any)).rejects.toThrow();

      expect(service.getUserInfo).toHaveBeenCalledWith('nonexistent@example.com', ['role']);;
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(authService.kickOut).not.toHaveBeenCalled();
    });
  });
});
