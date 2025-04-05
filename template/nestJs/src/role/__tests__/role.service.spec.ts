import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from '../role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role, Permission, Menu, User } from '@app/models';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';

describe('Role Service', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;
  let menuRepository: Repository<Menu>;
  let userRepository: Repository<User>;
  let i18nService: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Menu),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('mocked translation'),
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

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    menuRepository = module.get<Repository<Menu>>(getRepositoryToken(Menu));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto = { name: 'Admin', permissionIds: [1], menuIds: [1] };
      const mockRole = { id: 1, name: 'Admin', permission: [], menus: [] };

      jest.spyOn(roleRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(permissionRepository, 'find').mockResolvedValueOnce([]);
      jest.spyOn(menuRepository, 'find').mockResolvedValueOnce([]);
      jest.spyOn(roleRepository, 'save').mockResolvedValueOnce(mockRole);

      const result = await service.create(createRoleDto, false);

      expect(result).toEqual(mockRole);
      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Admin' } });
      expect(permissionRepository.find).toHaveBeenCalledWith({ where: { id: expect.anything() } });
      expect(menuRepository.find).toHaveBeenCalledWith({ where: { id: expect.anything() } });
      expect(roleRepository.save).toHaveBeenCalledWith({
        name: 'Admin',
        permission: [],
        menus: [],
      });
    });

    it('should throw an exception if role already exists', async () => {
      const createRoleDto = { name: 'Admin', permissionIds: [], menuIds: [] };
      const mockRole = { id: 1, name: 'Admin' };

      jest.spyOn(roleRepository, 'findOne').mockResolvedValueOnce(mockRole as any);

      await expect(service.create(createRoleDto, false)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const mockRoles = [{ id: 1, name: 'Admin' }];
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce(mockRoles as any);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(roleRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const mockRole = { id: 1, name: 'Admin', menus: [], permission: [] };
      jest.spyOn(roleRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(mockRole),
      } as any);

      const result = await service.findOne('1');

      expect(result).toEqual(mockRole);
    });

    it('should throw an exception if role not found', async () => {
      jest.spyOn(roleRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('1')).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      const mockRole = [{ id: 1, name: 'Admin' }];
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce(mockRole as any);
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([]);
      jest.spyOn(roleRepository, 'remove').mockResolvedValueOnce(mockRole as any);

      const result = await service.delete(1);

      expect(result).toEqual(mockRole);
      expect(roleRepository.find).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.find).toHaveBeenCalledWith({ where: { role: { id: 1 } }, take: 1 });
      expect(roleRepository.remove).toHaveBeenCalledWith(mockRole);
    });

    it('should throw an exception if role is associated with a user', async () => {
      const mockRole = [{ id: 1, name: 'Admin' }];
      const mockUser = [{ id: 1, name: 'User1', role: mockRole[0] }];
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce(mockRole as any);
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce(mockUser as any);

      await expect(service.delete(1)).rejects.toThrow(HttpException);
    });
  });
});