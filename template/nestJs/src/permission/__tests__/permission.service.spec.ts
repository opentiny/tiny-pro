import { Repository } from "typeorm";
import { PermissionService } from "../permission.service";
import { Permission } from "@app/models";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreatePermissionDto } from "../dto/create-permission.dto";
import { UpdatePermissionDto } from "../dto/update-permission.dto";
import { paginate } from "nestjs-typeorm-paginate";
import { HttpException } from "@nestjs/common";

describe('PermissionService', () => {
  let service: PermissionService;
  let repository: Repository<Permission>;
  let i18nService: I18nService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn(),
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

    service = module.get<PermissionService>(PermissionService);
    repository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    i18nService = module.get<I18nService>(I18nService);
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'test', desc: 'test desc' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockResolvedValue({ id: 1, ...createPermissionDto });

      const result = await service.create(createPermissionDto, false);

      expect(result).toEqual({ id: 1, ...createPermissionDto });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { name: 'test' } });
      expect(repository.save).toHaveBeenCalledWith({ name: 'test', desc: 'test desc' });
    });

    it('should throw an exception if permission already exists and isInit is false', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'test', desc: 'test desc' };
      jest.spyOn(repository, 'findOne').mockResolvedValue({ id: 1, ...createPermissionDto });
      jest.spyOn(i18nService, 't').mockReturnValue('Permission already exists');

      await expect(service.create(createPermissionDto, false)).rejects.toThrow(HttpException);
      expect(i18nService.t).toHaveBeenCalledWith('exception.permission.exists', {
        args: { name: 'test' },
        lang: undefined,
      });
    });
  });

  describe('updatePermission', () => {
    it('should update an existing permission', async () => {
      const updatePermissionDto: UpdatePermissionDto = { id: 1, name: 'updated', desc: 'updated desc' };
      jest.spyOn(repository, 'findOne').mockResolvedValue({ id: 1, name: 'test', desc: 'test desc' });
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.updatePermission(updatePermissionDto);

      expect(result).toEqual({ affected: 1 });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.update).toHaveBeenCalledWith(1, { name: 'updated', desc: 'updated desc' });
    });

    it('should throw an exception if permission does not exist', async () => {
      const updatePermissionDto: UpdatePermissionDto = { id: 1, name: 'updated', desc: 'updated desc' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(i18nService, 't').mockReturnValue('Permission does not exist');

      await expect(service.updatePermission(updatePermissionDto)).rejects.toThrow(HttpException);
      expect(i18nService.t).toHaveBeenCalledWith('exception.permission.notExists', { lang: undefined });
    });
  });

  describe('findPermission', () => {
    it('should return all permissions if no limit is provided', async () => {
      const permissions = [{ id: 1, name: 'test', desc: 'test desc' }];
      jest.spyOn(repository, 'find').mockResolvedValue(permissions);

      const result = await service.findPermission();

      expect(result).toEqual(permissions);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('delPermission', () => {
    it('should delete a permission', async () => {
      const permission = { id: 1, name: 'test', desc: 'test desc' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(permission);
      jest.spyOn(repository, 'remove').mockResolvedValue(permission);

      const result = await service.delPermission(1);

      expect(result).toEqual(permission);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(permission);
    });
  });
});