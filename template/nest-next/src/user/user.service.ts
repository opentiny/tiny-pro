import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserInfo } from './query/get-user-info.query';
import { GetAllUserQuery } from './query';
import { GetAllUserRequest } from './dto/get-all-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BatchRemoveUser,
  ChangePassword,
  CreateUserCommand,
  UpdateUserInfo,
  UpdateUserPassword,
} from './command';
import { RemoveUser } from './command/remove-user.command';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePwdUserDto } from './dto/update-pwd-user.dto';
import { UpdatePwdAdminDto } from './dto/update-pwd-admin.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}

  async createUser(dto: CreateUserDto) {
    const userId = await this.cb.execute(new CreateUserCommand(dto));

    const [userInfo] = await this.qb.execute(new GetUserInfo({ id: [userId] }));
    return userInfo;
  }

  async removeUser(email: string) {
    const id = await this.cb.execute(new RemoveUser(email));
    const [userInfo] = await this.qb.execute(new GetUserInfo({ id: [id] }));
    return userInfo;
  }

  async updateUserInfo(dto: UpdateUserDto) {
    const id = await this.qb.execute(new UpdateUserInfo(dto));
    const [userInfo] = await this.qb.execute(new GetUserInfo({ id: [id] }));
    return userInfo;
  }

  async changePassword(dto: UpdatePwdUserDto) {
    await this.cb.execute(
      new ChangePassword(dto.email, dto.oldPassword, dto.newPassword),
    );
  }
  async resetPassword(dto: UpdatePwdAdminDto) {
    await this.cb.execute(new UpdateUserPassword(dto.email, dto.newPassword));
  }

  async getUserInfo(email: string) {
    const [userInfo] = await this.qb.execute(
      new GetUserInfo({ email: [email] }),
    );
    return userInfo;
  }

  async getAllUser(dto: GetAllUserRequest) {
    return this.qb.execute(new GetAllUserQuery({ ...dto }));
  }

  async batchRemove(email: string[]) {
    const userIds = await this.cb.execute(new BatchRemoveUser(email));
    const userInfos = await this.qb.execute(new GetUserInfo({ id: userIds }));
    return userInfos;
  }
}
