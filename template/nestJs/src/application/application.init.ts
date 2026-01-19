import { Initializer } from "../initalizer.interface";
import { applicationData } from './init/data';
import { Repository } from "typeorm";
import { Application } from "@app/models";
import { InjectRepository } from "@nestjs/typeorm";

export class ApplicationInit implements Initializer<Promise<void>> {
  constructor(
    @InjectRepository(Application)
    private application: Repository<Application>
  ){}
  async run(): Promise<void> {
    for (const app of applicationData) {
      if (
        await this.application.findOne({where:{name:app.name}})
      ) {
        return;
      }
      await this.application.save(
        this.application.create(app)
      )
    }
  }
}
