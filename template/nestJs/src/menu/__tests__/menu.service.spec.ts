import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from '../menu.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Menu } from '@app/models';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { HttpException } from '@nestjs/common';

describe('Menu Service', () => {
  let service: MenuService;
  let userRepository: Repository<User>;
  let menuRepository: Repository<Menu>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Menu),
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

    jest.spyOn(I18nContext, 'current').mockReturnValue({
      lang: ''
    } as any)

    service = module.get<MenuService>(MenuService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    menuRepository = module.get<Repository<Menu>>(getRepositoryToken(Menu));
  });

  describe('findRoleMenu', ()=>{
    it('should return role menus as a tree structure', async () => {
      const mockUser = {
        role: [
          {
            menus: [
              { id: 1, parentId: null, name: 'Menu 1', path: '/menu1', component: 'Component1', icon: 'icon1', menuType: 'type1', order: 1, locale: 'en' },
              { id: 2, parentId: 1, name: 'Menu 2', path: '/menu2', component: 'Component2', icon: 'icon2', menuType: 'type2', order: 2, locale: 'en' },
            ],
          },
        ],
      };

      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findRoleMenu('test@example.com');

      expect(result).toEqual([
        {
          id: 1,
          label: 'Menu 1',
          url: '/menu1',
          component: 'Component1',
          customIcon: 'icon1',
          menuType: 'type1',
          parentId: null,
          order: 1,
          locale: 'en',
          children: [
            {
              id: 2,
              label: 'Menu 2',
              url: '/menu2',
              component: 'Component2',
              customIcon: 'icon2',
              menuType: 'type2',
              parentId: 1,
              order: 2,
              locale: 'en',
              children: [],
            },
          ],
        },
      ]);
    });

    it('should return an empty tree if no menus are found', async () => {
      const mockUser = {
        role: [
          {
            menus: [],
          },
        ],
      };

      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findRoleMenu('test@example.com');

      expect(result).toEqual([]);
    });
  })
  describe('findAllMenu', () => {
    it('should return all menus as a tree structure', async () => {
      const mockMenus = [
        { id: 1, parentId: null, name: 'Menu 1', path: '/menu1', component: 'Component1', icon: 'icon1', menuType: 'type1', order: 1, locale: 'en' },
        { id: 2, parentId: 1, name: 'Menu 2', path: '/menu2', component: 'Component2', icon: 'icon2', menuType: 'type2', order: 2, locale: 'en' },
      ];

      jest.spyOn(menuRepository, 'find').mockResolvedValue(mockMenus as any);

      const result = await service.findAllMenu();

      expect(result).toEqual([
        {
          id: 1,
          label: 'Menu 1',
          url: '/menu1',
          component: 'Component1',
          customIcon: 'icon1',
          menuType: 'type1',
          parentId: null,
          order: 1,
          locale: 'en',
          children: [
            {
              id: 2,
              label: 'Menu 2',
              url: '/menu2',
              component: 'Component2',
              customIcon: 'icon2',
              menuType: 'type2',
              parentId: 1,
              order: 2,
              locale: 'en',
              children: [],
            },
          ],
        },
      ]);
    });

    it('should return an empty tree if no menus are found', async () => {
      jest.spyOn(menuRepository, 'find').mockResolvedValue([]);

      const result = await service.findAllMenu();

      expect(result).toEqual([]);
    });
  });
  describe('createMenu', () => {
    it('should create a new menu if it does not exist and isInit is false', async () => {
      const createMenuDto = {
        order: 1,
        menuType: 'type1',
        name: 'Menu 1',
        path: '/menu1',
        component: 'Component1',
        icon: 'icon1',
        parentId: null,
        locale: 'en',
      };

      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(menuRepository, 'save').mockResolvedValue(createMenuDto as any);

      const result = await service.createMenu(createMenuDto, false);

      expect(result).toEqual(createMenuDto);
      expect(menuRepository.save).toHaveBeenCalledWith(createMenuDto);
    });

    it('should return the existing menu if it exists and isInit is true', async () => {
      const existingMenu = {
        id: 1,
        order: 1,
        menuType: 'type1',
        name: 'Menu 1',
        path: '/menu1',
        component: 'Component1',
        icon: 'icon1',
        parentId: null,
        locale: 'en',
      };

      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(existingMenu);
      jest.spyOn(menuRepository, 'save');
      const result = await service.createMenu(existingMenu, true);

      expect(result).toEqual(existingMenu);
      expect(menuRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an exception if the menu exists and isInit is false', async () => {
      const existingMenu = {
        id: 1,
        order: 1,
        menuType: 'type1',
        name: 'Menu 1',
        path: '/menu1',
        component: 'Component1',
        icon: 'icon1',
        parentId: null,
        locale: 'en',
      };

      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(existingMenu);
      jest.spyOn(I18nContext, 'current').mockReturnValue({ lang: 'en' } as any);
      jest.spyOn(menuRepository, 'save');

      await expect(service.createMenu(existingMenu, false)).rejects.toThrow(HttpException);

      expect(menuRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('updateMenu', () => {
    it('should update an existing menu with new data', async () => {
      const updateMenuDto = {
        id: 1,
        name: 'Updated Menu',
        path: '/updated-menu',
        component: 'UpdatedComponent',
        parentId: null,
        menuType: 'type1',
        icon: 'updated-icon',
        order: 1,
        locale: 'en',
      };

      jest.spyOn(menuRepository, 'update').mockResolvedValue({} as any);

      const result = await service.updateMenu(updateMenuDto);

      expect(result).toBe(true);
      expect(menuRepository.update).toHaveBeenCalledWith(updateMenuDto.id, {
        name: updateMenuDto.name,
        path: updateMenuDto.path,
        component: updateMenuDto.component,
        parentId: updateMenuDto.parentId,
        menuType: updateMenuDto.menuType,
        icon: updateMenuDto.icon,
        order: updateMenuDto.order,
        locale: updateMenuDto.locale,
      });
    });

    it('should handle errors when updating a menu', async () => {
      const updateMenuDto = {
        id: 1,
        name: 'Updated Menu',
        path: '/updated-menu',
        component: 'UpdatedComponent',
        parentId: null,
        menuType: 'type1',
        icon: 'updated-icon',
        order: 1,
        locale: 'en',
      };

      jest.spyOn(menuRepository, 'update').mockRejectedValue(new Error('Update failed'));

      await expect(service.updateMenu(updateMenuDto)).rejects.toThrow('Update failed');
      expect(menuRepository.update).toHaveBeenCalledWith(updateMenuDto.id, {
        name: updateMenuDto.name,
        path: updateMenuDto.path,
        component: updateMenuDto.component,
        parentId: updateMenuDto.parentId,
        menuType: updateMenuDto.menuType,
        icon: updateMenuDto.icon,
        order: updateMenuDto.order,
        locale: updateMenuDto.locale,
      });
    });
  });
  describe('deleteMenu', () => {
    it('should delete a menu and update child menus to have no parent if parentId is -1', async () => {
      const mockMenu = { id: 1, parentId: null };
      const mockChildMenu = { id: 2, parentId: 1 };

      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(mockMenu as any);
      jest.spyOn(menuRepository, 'find').mockResolvedValue([mockChildMenu] as any);
      jest.spyOn(menuRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(menuRepository, 'remove').mockResolvedValue(mockMenu as any);

      const result = await service.deleteMenu(1, -1);

      expect(menuRepository.update).toHaveBeenCalledWith(mockChildMenu.id, { parentId: null });
      expect(menuRepository.remove).toHaveBeenCalledWith(mockMenu);
      expect(result).toEqual(mockMenu);
    });

    it('should delete a menu and update child menus to have a new parent if parentId is not -1', async () => {
      const mockMenu = { id: 1, parentId: null };
      const mockChildMenu = { id: 2, parentId: 1 };

      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(mockMenu as any);
      jest.spyOn(menuRepository, 'find').mockResolvedValue([mockChildMenu] as any);
      jest.spyOn(menuRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(menuRepository, 'remove').mockResolvedValue(mockMenu as any);

      const result = await service.deleteMenu(1, 3);

      expect(menuRepository.update).toHaveBeenCalledWith(mockChildMenu.id, { parentId: 3 });
      expect(menuRepository.remove).toHaveBeenCalledWith(mockMenu);
      expect(result).toEqual(mockMenu);
    });

    it('should throw an error if the menu to delete is not found', async () => {
      jest.spyOn(menuRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(menuRepository, 'remove')
      await expect(service.deleteMenu(1, -1)).rejects.toThrow();
      expect(menuRepository.remove).not.toHaveBeenCalled();
    });
  });
});