import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';

export class E2EApp {
  public app: INestApplication;
  public orm: MikroORM;

  async init() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
    this.orm = this.app.get(MikroORM);
    await this.orm.schema.clear({ truncate: true });
  }

  async clearData() {
    await this.orm.schema.clear({ truncate: true });
  }

  async close() {
    await this.app.close();
  }
}
