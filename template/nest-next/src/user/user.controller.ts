import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseArrayPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UserInfo } from './dto/get-user-info.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { I18n } from 'nestjs-i18n';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '@app/shared';
import { GetAllUserQuery } from './query';
import { GetAllUserRequest } from './dto/get-all-user.dto';
import { UpdatePwdAdminDto } from './dto/update-pwd-admin.dto';
import { UpdatePwdUserDto } from './dto/update-pwd-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({summary: '创建用户'})
  @ApiCreatedResponse({
    type: ()=>UserInfo,
    description: '返回创建后的用户'
  })
  @ApiBearerAuth()
  @Post('reg')
  // @Permission('user::add')
  async register(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }


  @ApiOperation({summary: '获取用户信息'})
  @ApiParam({
    name: 'email',
    description: '用户邮箱'
  })
  @ApiOkResponse({
    type: ()=>UserInfo
  })

  // TODO: 如果登陆了就从request.user.email里面拿，否则从param里面拿
  // TODO: Auth还没写完，等写完了处理一下注释
  @Get('/info/:email?')
  async getUserInfo(
    // @I18n() i18n: I18nContext<I18nTranslations>,
    // @Req() request: Request & RequestUser,
    @Param('email') email: string
  ) {
    // const _email = email ? email : request.user.email;
    // if (!_email) {
    //   throw new HttpException(
    //     i18n.t('exception.common.unauth', { lang: I18nContext.current().lang }),
    //     HttpStatus.UNAUTHORIZED
    //   );
    // }
    return this.userService.getUserInfo(email);
  }

  @ApiOperation({summary: '删除用户'})
  @ApiParam({
    name: 'email',
    description: '用户邮箱'
  })
  @ApiOkResponse({
    type: UserInfo
  })
  // @Reject()
  @Delete('/:email')
  // @Permission('user::remove')
  async delUser(@Param('email') email: string) {
    return this.userService.removeUser(email);
  }

  @ApiOperation({summary: '修改用户信息'})
  @ApiOkResponse({
    type: UserInfo,
  })
  // @Reject()
  @Patch('/update')
  // @Permission('user::update')
  async UpdateUser(@Body() body: UpdateUserDto) {
    return this.userService.updateUserInfo(body);
  }

  @ApiOperation({summary: '分页查询用户'})
  @Get()
  // @Permission('user::query')
  async getAllUser(
    @Query() query: GetAllUserRequest
  ) {
    return this.userService.getAllUser(query);
  }

  @ApiOperation({summary: '修改某位用户的密码', description: '强制性的修改'})
  // @Reject()
  @Patch('/admin/updatePwd')
  // @Permission('user::password::force-update')
  async updatePwdAdmin(@Body() body: UpdatePwdAdminDto) {
    return this.userService.resetPassword(body);
  }

  @ApiOperation({summary: '修改自身的密码'})
  // @Reject()
  @Patch('/updatePwd')
  // @Permission('user::update')
  async updatePwdUser(@Body() body: UpdatePwdUserDto) {
    return this.userService.changePassword(body);
  }

  @ApiOperation({summary: '批量删除用户'})
  @ApiOkResponse({
    type: [UserInfo]
  })
  // @Reject()
  @Post('/batch')
  // @Permission('user::batch-remove')
  async batchRemoveUser(
    @Body() emails: string[],
  ) {
    return this.userService.batchRemove(emails);
  }
}