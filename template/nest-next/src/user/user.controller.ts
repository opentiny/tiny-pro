import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { UserInfo } from './dto/get-user-info.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission, Reject } from '@app/shared';
import { GetAllUserRequest } from './dto/get-all-user.dto';
import { UpdatePwdAdminDto } from './dto/update-pwd-admin.dto';
import { UpdatePwdUserDto } from './dto/update-pwd-user.dto';
import { TokenPayload } from 'src/auth/deocrators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiCreatedResponse({
    type: () => UserInfo,
    description: '返回创建后的用户',
  })
  @ApiBearerAuth()
  @Post('reg')
  @Permission('user::add')
  async register(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @ApiOperation({ summary: '获取用户信息' })
  @ApiParam({
    name: 'email',
    description: '用户邮箱',
  })
  @ApiOkResponse({
    type: () => UserInfo,
  })
  @Get('/info/{:email}')
  async getUserInfo(
    @TokenPayload('email') tokenEmail: string,
    @Param('email') email: string,
  ) {
    const _email = email || tokenEmail;
    return this.userService.getUserInfo(_email);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiParam({
    name: 'email',
    description: '用户邮箱',
  })
  @ApiOkResponse({
    type: UserInfo,
  })
  @Reject()
  @Delete('/:email')
  @Permission('user::remove')
  async delUser(@Param('email') email: string) {
    return this.userService.removeUser(email);
  }

  @ApiOperation({ summary: '修改用户信息' })
  @ApiOkResponse({
    type: UserInfo,
  })
  @Reject()
  @Patch('/update')
  @Permission('user::update')
  async UpdateUser(@Body() body: UpdateUserDto) {
    return this.userService.updateUserInfo(body);
  }

  @ApiOperation({ summary: '分页查询用户' })
  @Get()
  @Permission('user::query')
  async getAllUser(@Query() query: GetAllUserRequest) {
    return this.userService.getAllUser(query);
  }

  @ApiOperation({ summary: '修改某位用户的密码', description: '强制性的修改' })
  @Reject()
  @Patch('/admin/updatePwd')
  @Permission('user::password::force-update')
  async updatePwdAdmin(@Body() body: UpdatePwdAdminDto) {
    return this.userService.resetPassword(body);
  }

  @ApiOperation({ summary: '修改自身的密码' })
  @Reject()
  @Patch('/updatePwd')
  @Permission('user::update')
  async updatePwdUser(@Body() body: UpdatePwdUserDto) {
    return this.userService.changePassword(body);
  }

  @ApiOperation({ summary: '批量删除用户' })
  @ApiOkResponse({
    type: [UserInfo],
  })
  @Reject()
  @Post('/batch')
  @Permission('user::batch-remove')
  async batchRemoveUser(@Body() emails: string[]) {
    return this.userService.batchRemove(emails);
  }
}
