import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  GetPermissionInfo,
  GetPermissionResponse,
} from '../dto/get-permissions.dto';
import { EntityRepository } from '@mikro-orm/mysql';
import { Permission } from '../permission.entry';
import { PaginationMeta } from '@app/shared';
import { InjectRepository } from '@mikro-orm/nestjs';

export class GetAllPermissionQuery extends Query<GetPermissionResponse> {
  constructor(
    public readonly page: number,
    public readonly size: number,
    public readonly name?: string,
  ) {
    super();
  }
}

@QueryHandler(GetAllPermissionQuery)
export class GetAllPermissionQueryHandler implements IQueryHandler<GetAllPermissionQuery> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: EntityRepository<Permission>,
  ) {}
  async execute(query: GetAllPermissionQuery): Promise<GetPermissionResponse> {
    const [items, total] = await this.permissionRepo.findAndCount(
      {
        name: { $like: `%${query.name}%` },
      },
      {
        offset: (query.page - 1) * query.size,
        limit: query.size,
      },
    );
    const meta = new PaginationMeta(
      items.length,
      total,
      query.size,
      query.page,
    );
    const infos = items.map(
      (item) => new GetPermissionInfo(item.id, item.desc, item.name),
    );
    return new GetPermissionResponse(infos, meta);
  }
}
