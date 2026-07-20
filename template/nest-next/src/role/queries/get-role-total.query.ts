import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Role } from '../role.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { md5, roleTotal } from '@app/shared';

export class GetRoleTotal extends Query<number> {
  constructor(public readonly name?: string) {
    super();
  }
}

@QueryHandler(GetRoleTotal)
export class GetRoleTotalHandler implements IQueryHandler<GetRoleTotal> {
  private redis: Redis;
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  async execute(query: GetRoleTotal): Promise<number> {
    const key = query.name ? roleTotal(md5([query.name])) : roleTotal();
    if (await this.redis.exists(key)) {
      return this.redis.get(key).then((val) => (val ? Number(val) : 1));
    }
    const cnt = await this.roleRepo.count(
      query.name
        ? {
            name: { $like: `${query.name}` },
          }
        : {},
    );
    await this.redis.set(key, cnt, 'EX', 60);
    return cnt;
  }
}
