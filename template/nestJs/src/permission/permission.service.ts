import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@app/models';
import { Like, Repository } from 'typeorm';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permission: Repository<Permission>,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}
  async create(createPermissionDto: CreatePermissionDto, isInit: boolean) {
    const { name, desc } = createPermissionDto;
    const permissionInfo = this.permission.findOne({
      where: { name },
    });
    if (isInit == true && (await permissionInfo)) {
      return permissionInfo;
    }
    if ((await permissionInfo) && isInit == false) {
      throw new HttpException(
        this.i18n.t('exception.permission.exists', {
          args: { name },
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    const permission = await this.permission.save({ name, desc });
    return permission;
  }
  async updatePermission(dto: UpdatePermissionDto) {
    const { name, desc, id } = dto;
    const permissionInfo = await this.permission.findOne({
      where: { id },
    });
    if (!permissionInfo) {
      throw new HttpException(
        this.i18n.t('exception.permission.notExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    return this.permission.update(id, { name, desc });
  }
  async findPermission(page?: number, limit?: number, name?: string) {
    if (!limit) {
      return this.permission.find();
    }
    const count = await this.permission.count();
    return paginate(
      this.permission,
      {
        limit: limit ? limit : count,
        page,
      },
      {
        where: {
          name: name ? Like(name) : undefined,
        },
      }
    );
  }
  async delPermission(id: number) {
    const permissionInfo = await this.permission.findOne({
      where: { id },
    });
    return this.permission.remove(permissionInfo);
  }
}
