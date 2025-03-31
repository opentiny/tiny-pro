import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu, Permission, Role, User } from '@app/models';
import { In, Like, Repository } from 'typeorm';
import { convertToTree } from '../menu/menu.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../.generate/i18n.generated';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly role: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permission: Repository<Permission>,
    @InjectRepository(Menu)
    private readonly menu: Repository<Menu>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}
  async create(createRoleDto: CreateRoleDto, isInit: boolean) {
    const { name, permissionIds = [], menuIds = [] } = createRoleDto;
    const roleInfo = this.role.findOne({
      where: {
        name,
      },
    });
    if (isInit == true && (await roleInfo)) {
      return roleInfo;
    }
    if (await roleInfo) {
      throw new HttpException(
        this.i18n.t('exception.role.exists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    const permissions = await this.permission.find({
      where: {
        id: In(permissionIds),
      },
    });
    const menus = await this.menu.find({
      where: {
        id: In(menuIds),
      },
    });
    return this.role.save({ name, permission: permissions, menus });
  }
  findAll() {
    return this.role.find();
  }

  async findAllDetail(page?: number, limit?: number, name?: string) {
    const roleInfo = await paginate(
      this.role,
      {
        page,
        limit,
      },
      {
        where: {
          name: name ? Like(name) : undefined,
        },
        relations: ['permission', 'menus'],
      }
    );
    const menuTree = [];
    for (const item of roleInfo.items) {
      menuTree.push(convertToTree(item.menus));
    }
    return {
      roleInfo,
      menuTree,
    };
  }

  async findOne(id: string) {
    const roleInfo = await this.role
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.menus', 'menus')
      .leftJoinAndSelect('role.permission', 'permission')
      .where({
        id: parseInt(id),
      })
      .getOne();
    if (!roleInfo) {
      throw new HttpException(
        this.i18n.t('exception.role.notExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    return roleInfo;
  }

  async update(data: UpdateRoleDto) {
    const permission = await this.permission.find({
      where: {
        id: In(data.permissionIds ?? []),
      },
    });
    const menus = await this.menu.find({
      where: {
        id: In(data.menuIds ?? []),
      },
    });
    const { id, name } = data;
    const roleInfo = await this.role.find({
      where: {
        id: id,
      },
    });
    if (roleInfo.length === 0) {
      throw new HttpException(
        this.i18n.t('exception.role.notExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    const role = roleInfo[0];
    role.name = name;
    if (data.permissionIds) {
      role.permission = permission;
    }
    if (data.menuIds) {
      role.menus = menus;
    }
    return this.role.save(role);
  }
  async delete(id: number) {
    const role = await this.role.find({
      where: {
        id: id,
      },
    });
    const user = await this.user.find({
      where: {
        role: {
          id,
        },
      },
      take: 1,
    });
    if (user.length) {
      throw new HttpException(
        this.i18n.t('exception.role.conflict', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.CONFLICT
      );
    }
    return this.role.remove(role);
  }
}
