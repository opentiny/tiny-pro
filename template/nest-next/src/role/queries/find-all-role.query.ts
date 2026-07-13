import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Role } from '../role.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

export class FindAllRole extends Query<Role[]> {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly name?: string,
  ) {
    super();
  }
}

@QueryHandler(FindAllRole)
export class FindAllRoleHandler implements IQueryHandler<FindAllRole> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
  ) {}
  execute(query: FindAllRole): Promise<Role[]> {
    const filter =
      query.page && query.limit
        ? {
            page: query.page,
            limit: query.limit,
          }
        : {};
    return this.roleRepo.findAll({
      ...filter,
      where: {
        name: query.name
          ? {
              $like: `${query.name}`,
            }
          : undefined,
      },
    });
  }
}
