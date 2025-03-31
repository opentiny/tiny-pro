import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { encry, User } from '@app/models';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../libs/redis/redis.service';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private user: Repository<User>,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}

  async getToken(userId: string): Promise<string | null> {
    return this.redisService.getUserToken(`user:${userId}:token`);
  }

  async kickOut(email: string) {
    await this.redisService.delUserToken(`user:${email}:token`);
  }

  async logout(token: string): Promise<void> {
    //通过token解析email
    const decoded = await this.jwtService.verify(token);
    //退出登录后，将token从Redis删除
    await this.redisService.delUserToken(`user:${decoded.email}:token`);
    return;
  }

  async login(dto: CreateAuthDto) {
    const { email, password } = dto;
    const userInfo = await this.user.findOne({ where: { email } });
    if (userInfo === null) {
      throw new HttpException(
        this.i18n.translate('exception.auth.userNotExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    if (encry(password, userInfo.salt) !== userInfo.password) {
      throw new HttpException(
        this.i18n.translate('exception.auth.passwordOrEmailError', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    const payload = {
      email,
    };
    const token = this.jwtService.signAsync(payload);
    //将token设置到Redis中，有效期2h
    await this.redisService.setUserToken(
      `user:${email}:token`,
      await token,
      await parseInt(process.env.REDIS_SECONDS)
    );
    return {
      token: await token,
    };
  }
}
