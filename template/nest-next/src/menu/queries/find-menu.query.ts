import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Menu } from '../menu.entity';
import { EntityRepository } from '@mikro-orm/core';

export class FindMenu extends Query<Menu[]> {
  constructor(public readonly id: number[]) {
    super();
  }
}

@QueryHandler(FindMenu)
export class FindMenuHandler implements IQueryHandler<FindMenu> {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
  ) {}
  async execute(query: FindMenu): Promise<Menu[]> {
    const menus = await this.menuRepo.find({
      id: {
        $in: query.id,
      },
    });
    return menus;
  }
}
