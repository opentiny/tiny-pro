import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Role } from '../role.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

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
    const cnt = await this.roleRepo.count(
      query.name
        ? {
            name: { $like: `${query.name}` },
          }
        : {},
    );
    return cnt;
  }
}
