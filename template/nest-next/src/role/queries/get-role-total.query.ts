import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Role } from '../role.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { roleTotal } from '@app/shared';

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
    if (!query.name) {
      const cnt = await this.roleRepo.count({
        name: query.name ? { $like: `${query.name}` } : undefined,
      });
      return cnt;
    }
    return this.redis.get(roleTotal()).then((val) => (val ? Number(val) : 1));
  }
}
