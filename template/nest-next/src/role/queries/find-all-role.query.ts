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
  async execute(query: FindAllRole): Promise<Role[]> {
    const filter =
      query.page && query.limit
        ? {
            offset: (query.page - 1) * query.limit,
            limit: query.limit,
          }
        : {};
    return this.roleRepo.findAll({
      ...filter,
      where: query.name
        ? {
            name: query.name,
          }
        : undefined,
    });
  }
}
