import { EntityRepository } from '@mikro-orm/mysql';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../user';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserNotFound } from '../errors';

export class FindUserForAuthenticationQuery extends Query<Readonly<User>> {
  constructor(public readonly email: string) {
    super();
  }
}

@QueryHandler(FindUserForAuthenticationQuery)
export class FindUserForAuthenticationQueryHandler implements IQueryHandler<FindUserForAuthenticationQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}
  async execute(
    query: FindUserForAuthenticationQuery,
  ): Promise<Readonly<User>> {
    const user = await this.userRepository.findOne({ email: query.email });
    if (!user) {
      throw new UserNotFound();
    }
    return user;
  }
}
