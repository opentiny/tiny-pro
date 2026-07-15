import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetAllUserRequest, UserItem, UserList } from '../dto/get-all-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../user.entity';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { PaginationMeta, userTotal } from '@app/shared';
import { formatDateToDay } from '../utils';

export class GetAllUserQuery extends Query<UserList> {
  constructor(public readonly dto: GetAllUserRequest) {
    super();
  }
}

@QueryHandler(GetAllUserQuery)
export class GetAllUserQueryHandler implements IQueryHandler<GetAllUserQuery> {
  private redis: Redis;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    redisService: RedisService,
  ) {
    this.redis = redisService.getOrThrow();
  }
  async execute({
    dto: { name, role, email, page = 1, limit = 10 },
  }: GetAllUserQuery): Promise<UserList> {
    const whereCondition: FilterQuery<User> = {};
    if (name) whereCondition.name = { $like: name };
    if (role?.length) whereCondition.role = { $in: role };
    if (email) whereCondition.email = { $like: email };
    const user = await this.userRepository.find(whereCondition, {
      limit,
      offset: (page - 1) * limit,
      fields: [
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
    });
    const total = await this.redis
      .get(userTotal())
      .then((value) => (!value ? 0 : Number.parseInt(value)));
    const meta = new PaginationMeta(limit, total, limit, page);
    const items = user.map(
      (user) =>
        new UserItem(
          user.id,
          user.name,
          user.email,
          user.department,
          user.employeeType,
          user.protocolStart
            ? formatDateToDay(new Date(user.protocolStart))
            : user.protocolStart,
          user.protocolEnd
            ? formatDateToDay(new Date(user.protocolEnd))
            : user.protocolEnd,
          user.probationEnd
            ? formatDateToDay(new Date(user.probationEnd))
            : user.probationEnd,
          user.probationStart
            ? formatDateToDay(new Date(user.probationStart))
            : user.probationStart,
          user.probationDuration,
          user.address,
          user.status,
        ),
    );
    return new UserList(items, meta);
  }
}
