import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {
  ChangePasswordService,
  UpdateUserInfoService,
  UpdateUserPasswordService,
  UserCreateService,
} from './command';
import { GetAllUserService, GetUserInfoService } from './query';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User, UserRole } from './user.entity';
import { Role, RoleMenu, RolePermission } from '../role';
import { Permission } from '../permission';
import { Menu } from '../menu';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      User,
      UserRole,
      Role,
      RolePermission,
      RoleMenu,
      Permission,
      Menu,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    ChangePasswordService,
    UpdateUserPasswordService,
    UserCreateService,
    UpdateUserInfoService,
    UpdateUserPasswordService,
    GetUserInfoService,
    GetAllUserService,
  ],
})
export class UserModule {}
