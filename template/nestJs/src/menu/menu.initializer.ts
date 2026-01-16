import { Menu } from "@app/models";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { readFileSync } from "fs";
import { join } from "path";
import { Initializer } from "../initalizer.interface";
import { Repository } from "typeorm";


type RawMenuData = {
  label: string;
  url: string;
  component: string;
  icon: string;
  locale: string;
  menuType: string;
  children?: RawMenuData[]
}

@Injectable()
export class MenuInitializer implements Initializer<Promise<void>> {
  constructor(
    @InjectRepository(Menu)
    private menu: Repository<Menu>,
  ){}

  async run(){
    const path = join(process.cwd(), 'menu-data.json');
    const menuData:RawMenuData[] = JSON.parse(readFileSync(path).toString());
    const dfs = async (data: RawMenuData, level: number, parentId: number) =>{
      const menu = new Menu();
      menu.component = data.component;
      menu.icon = data.icon;
      menu.locale = data.locale;
      menu.menuType = data.menuType || '';
      menu.name = data.label;
      menu.order = level;
      menu.parentId = parentId || null;
      menu.path = data.url;
      const res = await this.menu.findOne({
        where: {
          path: menu.path
        }
      }) || await this.menu.save(menu);
      if (!data.children) {
        return;
      }
      for (const child of data.children) {
        dfs(child, 0, res.id)
      }
    }
    for (const data of menuData) {
      await dfs(data, 0, undefined);
    }
  }
}
