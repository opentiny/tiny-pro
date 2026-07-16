import { Command, CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { User, UserId } from "../user.entity";
import { EntityRepository } from "@mikro-orm/mysql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { UserRemovedEvent } from "../events";

export class BatchRemoveUser extends Command<UserId[]>{
  constructor(
    public readonly email: string[]
  ){
    super();
  }
}

@CommandHandler(BatchRemoveUser)
export class BatchRemoveUserService implements ICommandHandler<BatchRemoveUser>{
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly eventBus: EventBus
  ){

  }
  async execute(command: BatchRemoveUser): Promise<UserId[]> {
    const removedUser = await this.userRepo.findAll({
      where:{
        email: {$in: command.email}
      }
    });
    const userIds = removedUser.map((user) => user.id);
    await this.userRepo.getEntityManager()
    .transactional(async (em) => {
      await this.userRepo.nativeDelete({
        id:{
          $in: userIds
        }
      }, {em});
    })
    const events = userIds.map((id) => new UserRemovedEvent(id));
    this.eventBus.publishAll(events);
    return userIds;
  }
}