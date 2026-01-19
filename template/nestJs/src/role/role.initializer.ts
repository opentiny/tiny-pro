import { Injectable } from "@nestjs/common";
import { Initializer } from "../initalizer.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Menu, Permission, Role } from "@app/models";
import { Repository } from "typeorm";

@Injectable()
export class RoleInit implements Initializer<Promise<void>> {
  constructor(
    @InjectRepository(Role)
    private role: Repository<Role>,
    @InjectRepository(Permission)
    private permission: Repository<Permission>,
    @InjectRepository(Menu)
    private menu: Repository<Menu>
  ){

  }
  async run(): Promise<void> {
    const permission = await this.permission.find({
      where:{
        name: '*'
      }
    })
    const menus = await this.menu.find();
    if (await this.role.findOneBy({name: 'admin'})) {
      return;
    }
    await this.role.save({
      name: 'admin',
      permission: permission,
      menus
    });
  }
}
