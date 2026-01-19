import { InjectRepository } from "@nestjs/typeorm";
import { Initializer } from "../initalizer.interface";
import { Role, User } from "@app/models";
import { Repository } from "typeorm";
import { UserService } from "./user.service";
import { Logger } from "@nestjs/common";

export class UserInit implements Initializer<Promise<void>> {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private user: UserService,
    @InjectRepository(Role)
    private role: Repository<Role>
  ){}
  async run(): Promise<void> {
    const role = await this.role.findOneOrFail({
      where:{
        name: 'admin'
      }
    });
    if (
      await this.userRepo.findOneBy({
        email: 'admin@no-reply.com'
      })
    ) {
      return;
    }
    const user = await this.user.create(
      {
        email: 'admin@no-reply.com',
        password: 'admin',
        roleIds: [role.id],
        name: 'admin',
        status: 1,
      },
      true
    );
    Logger.log(`[APP]: create admin user success`);
    Logger.log(`[APP]: email: ${user.email}`);
    Logger.log(`[APP]: password: 'admin'`);
    Logger.log('Enjoy!');
  }
}
