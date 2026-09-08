import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserId, UserRole } from '../user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mysql';
import { Role } from '../../role';
import { UserExistsError } from '../error/user-exists.error';

export class CreateUserCommand extends Command<UserId> {
  constructor(public data: CreateUserDto) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserService implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: EntityRepository<Role>,
  ) {}
  async execute({ data }: CreateUserCommand): Promise<UserId> {
    const {
      email,
      password,
      roleIds = [],
      name,
      department,
      employeeType,
      probationStart,
      probationEnd,
      probationDuration,
      protocolStart,
      protocolEnd,
      address,
      status,
    } = data;
    const dbUser = await this.userRepository.findOne({
      email,
    });
    if (dbUser) {
      throw new UserExistsError(dbUser.email);
    }
    const roles = await this.roleRepository.findAll({
      where: {
        id: {
          $in: roleIds,
        },
      },
    });
    const user = this.userRepository.create({
      email,
      password,
      name: name,
      role: [],
      department: department,
      employeeType: employeeType,
      protocolStart: protocolStart,
      protocolEnd: protocolEnd,
      probationEnd: probationEnd,
      probationStart: probationStart,
      probationDuration: probationDuration,
      address: address,
      status: status,
    });
    for (const role of roles) {
      user.role.add(new UserRole(user, role.id));
    }
    this.userRepository.getEntityManager().persist(user);
    await this.userRepository.getEntityManager().flush();
    return user.id;
  }
}
