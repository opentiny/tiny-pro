import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { User, UserId, UserRole } from '../user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserUserRoleChangedEvent } from '../events';

export class UpdateUserInfo extends Command<UserId> {
  constructor(public readonly dto: UpdateUserDto) {
    super();
  }
}

@CommandHandler(UpdateUserInfo)
export class UpdateUserInfoService implements ICommandHandler<UpdateUserInfo> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly eventBus: EventBus,
  ) {}
  async execute({ dto }: UpdateUserInfo): Promise<UserId> {
    const { email, roleIds } = dto;
    const user = await this.userRepository.findOneOrFail(
      { email },
      { populate: ['role'] },
    );
    for (const key of Object.keys(dto)) {
      if (key === 'email' || key === 'roleIds') {
        continue;
      }
      if (dto[key] === undefined) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user[key] = dto[key];
    }
    const existsRoleIds = user.role
      .getItems()
      .map((id) => id.roleId)
      .join(':');
    const roles = roleIds.map((id) => new UserRole(user, id));
    user.role.set(roles);
    this.userRepository.getEntityManager().persist(user);
    await this.userRepository.getEntityManager().flush();
    if (existsRoleIds !== roleIds.join(':')) {
      await this.eventBus.publish(new UserUserRoleChangedEvent(user.id));
    }
    return user.id;
  }
}
