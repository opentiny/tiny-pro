import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserInfo } from './query/get-user-info.query';

@Injectable()
export class UserService {
  constructor(private readonly qb: QueryBus) {}

  async getUserInfo(email: string) {
    return this.qb.execute(new GetUserInfo(email));
  }
}
