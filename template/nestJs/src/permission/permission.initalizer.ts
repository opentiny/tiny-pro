import { InjectRepository } from "@nestjs/typeorm";
import { Initializer } from "../initalizer.interface";
import { Permission } from "@app/models";
import { Repository } from "typeorm";

export class PermissionInit implements Initializer<Promise<void>>{
  constructor(
    @InjectRepository(Permission)
    private permission: Repository<Permission>,
  ){}
  async run(): Promise<void> {
    const permissions = {
      user: [
        'add',
        'remove',
        'update',
        'query',
        'password::force-update',
        'batch-remove',
      ],
      permission: ['add', 'remove', 'update', 'get'],
      role: ['add', 'remove', 'update', 'query'],
      menu: ['add', 'remove', 'update', 'query'],
      i18n: ['add', 'remove', 'update', 'query', 'batch-remove'],
      lang: ['add', 'remove', 'update', 'query'],
    };
    const permissionEntites:Permission[] = [];
    permissionEntites.push(
      this.permission.create({
        name: '*',
        desc: ''
      })
    );
    for (const [module, actions] of Object.entries(permissions)) {
      for (const action of actions) {
        if (
          await this.permission.findOne({
            where:{name: `${module}::${action}`}
          })
        ) {
          continue;
        }
        const p = this.permission.create(
          {
            name: `${module}::${action}`,
            desc: '',
          },
        )
        permissionEntites.push(p);
      }
    }
    await this.permission.save(permissionEntites);
  }
}
