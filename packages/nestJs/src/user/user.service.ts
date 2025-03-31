import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdatePwdAdminDto } from './dto/update-pwd-admin.dto';
import { UpdatePwdUserDto } from './dto/update-pwd-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '@app/models';
import { In, Like, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AuthService } from '../auth/auth.service';
import { paginate } from 'nestjs-typeorm-paginate';
import * as process from 'process';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../.generate/i18n.generated';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRep: Repository<User>,
    @InjectRepository(Role)
    private roleRep: Repository<Role>,
    private readonly authService: AuthService,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}

  async create(createUserDto: CreateUserDto, isInit: boolean) {
    const {
      email,
      password,
      roleIds = [],
      name,
      department,
      employeeType,
      probationStart,
      probationEnd,
      probationDuration,
      protocolStart,
      protocolEnd,
      address,
      status,
    } = createUserDto;
    const userInfo = this.getUserInfo(email);
    if (isInit == true && (await userInfo)) {
      return userInfo;
    }
    if (await userInfo) {
      throw new HttpException(
        this.i18n.translate('exception.user.userExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    const roles = this.roleRep.find({
      where: {
        id: In(roleIds),
      },
    });
    try {
      const user = this.userRep.create({
        email,
        password,
        name: name,
        role: await roles,
        department: department,
        employeeType: employeeType,
        protocolStart: protocolStart,
        protocolEnd: protocolEnd,
        probationEnd: probationEnd,
        probationStart: probationStart,
        probationDuration: probationDuration,
        address: address,
        status: status,
      });
      return this.userRep.save(user);
    } catch (err) {
      throw new HttpException(
        (err as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //获取所有用户信息
  async getAllUser(
    paginationQuery: PaginationQueryDto,
    name?: string,
    role?: number[],
    email?: string
  ): Promise<any> {
    const { page, limit } = paginationQuery; // 从DTO获取分页参数
    const relations = ['role', 'role.permission'];
    const result = await paginate<User>(
      this.userRep,
      {
        page: Number(page) || Number(process.env.PAGITION_PAGE),
        limit: Number(limit) || Number(process.env.PAGITION_LIMIT),
      },
      {
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
        where: {
          name: name ? Like(name) : undefined,
          role:
            role && role.length
              ? {
                  id: In(role),
                }
              : undefined,
          email: email ? Like(email) : undefined,
        },
      }
    );
    for (const user of result.items) {
      if (user.probationStart !== null) {
        user.probationStart = await this.formatDateToDay(
          new Date(user.probationStart)
        );
      }
      if (user.probationEnd !== null) {
        user.probationEnd = await this.formatDateToDay(
          new Date(user.probationEnd)
        );
      }
      if (user.protocolStart !== null) {
        user.protocolStart = await this.formatDateToDay(
          new Date(user.protocolStart)
        );
      }
      if (user.protocolEnd !== null) {
        user.protocolEnd = await this.formatDateToDay(
          new Date(user.protocolEnd)
        );
      }
    }
    return result;
  }

  async formatDateToDay(date: {
    getFullYear: () => any;
    getMonth: () => number;
    getDate: () => any;
  }) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getUserInfo(email: string, relations: string[] = []) {
    const user = await this.userRep.findOne({
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
    if (user) {
      if (user.probationStart !== null) {
        user.probationStart = await this.formatDateToDay(
          new Date(user.probationStart)
        );
      }
      if (user.probationEnd !== null) {
        user.probationEnd = await this.formatDateToDay(
          new Date(user.probationEnd)
        );
      }
      if (user.protocolStart !== null) {
        user.protocolStart = await this.formatDateToDay(
          new Date(user.protocolStart)
        );
      }
      if (user.protocolEnd !== null) {
        user.protocolEnd = await this.formatDateToDay(
          new Date(user.protocolEnd)
        );
      }
    }
    return user;
  }

  async getUserPermission(token: string, userInfo: User) {
    const { email } = userInfo;
    const { role } = (await this.getUserInfo(email, [
      'role',
      'role.permission',
    ])) ?? { role: [] as Role[] };
    const permission = role.flatMap((r) => r.permission);
    const permissionNames = permission.map((p) => p.name);
    return [...new Set([...permissionNames])];
  }

  //验证旧密码是否正确
  async verifyPassword(password: string, storedHash: string, salt: string) {
    const newHash = crypto
      .pbkdf2Sync(password, salt, 1000, 18, 'sha256')
      .toString('hex');
    return newHash === storedHash;
  }

  //修改密码后加密
  async encry(value: string, salt: string) {
    return crypto.pbkdf2Sync(value, salt, 1000, 18, 'sha256').toString('hex');
  }

  async deleteUser(email: string) {
    const allUser = await this.userRep.find();
    if (allUser.length > 1) {
      const user = await this.userRep.findOne({
        where: { email },
      });
      if (!user) {
        return;
      }
      await this.authService.kickOut(email);
      return this.userRep.remove(user);
    }
    throw new HttpException(
      this.i18n.translate('exception.user.userNumberNull', {
        lang: I18nContext.current().lang,
      }),
      HttpStatus.BAD_REQUEST
    );
  }

  //修改密码
  async updatePwdUser(data: UpdatePwdUserDto) {
    const { email, newPassword, oldPassword, token } = data;
    const user = this.userRep.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'salt', 'password'],
    });
    if (user) {
      if (
        !(await this.verifyPassword(
          oldPassword,
          (
            await user
          ).password,
          (
            await user
          ).salt
        ))
      ) {
        throw new HttpException(
          this.i18n.translate('exception.user.oldPasswordError', {
            lang: I18nContext.current().lang,
          }),
          HttpStatus.BAD_REQUEST
        );
      } else {
        (await user).password = await this.encry(
          newPassword,
          (
            await user
          ).salt
        );
        await this.userRep.save(await user);
        await this.authService.kickOut((await user).email);
        return;
      }
    }
  }

  async updatePwdAdmin(data: UpdatePwdAdminDto) {
    const { email, newPassword } = data;
    const user = this.userRep.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'salt', 'password'],
    });
    if (user) {
      (await user).password = await this.encry(newPassword, (await user).salt);
      await this.userRep.save(await user);
      await this.authService.kickOut((await user).email);
      return;
    }
  }

  async updateUserInfo(updateUserDto: UpdateUserDto) {
    const {
      email,
      roleIds,
      department,
      employeeType,
      probationStart,
      probationEnd,
      probationDuration,
      protocolStart,
      protocolEnd,
      address,
      status,
      name,
    } = updateUserDto;
    const user = this.getUserInfo(email, ['role']);
    const roles = this.roleRep.find({
      where: {
        id: In(roleIds),
      },
    });
    const userRoles = (await user).role.map((role) => role.id).join('');
    if (user) {
      (await user).name = name;
      (await user).department = department;
      (await user).employeeType = employeeType;
      (await user).probationStart = probationStart;
      (await user).probationEnd = probationEnd;
      (await user).probationDuration = probationDuration;
      (await user).protocolStart = protocolStart;
      (await user).protocolEnd = protocolEnd;
      (await user).address = address;
      (await user).status = status;
      (await user).role = await roles;
    }
    const newProfile = await this.userRep.save(await user);
    if (userRoles !== roleIds.join('')) {
      await this.authService.kickOut(email);
    }
    return newProfile;
  }
}
