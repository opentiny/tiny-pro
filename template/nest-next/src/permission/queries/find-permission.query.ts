import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Permission, PermissionId } from '../permission.entry';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

export class FindPermission extends Query<Readonly<Permission[]>> {
  constructor(public readonly id: PermissionId[]) {
    super();
  }
}

@QueryHandler(FindPermission)
export class FindPermissionHandler implements IQueryHandler<FindPermission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: EntityRepository<Permission>,
  ) {}
  async execute(query: FindPermission): Promise<readonly Permission[]> {
    return this.permissionRepo.find({
      id: {
        $in: query.id,
      },
    });
  }
}
