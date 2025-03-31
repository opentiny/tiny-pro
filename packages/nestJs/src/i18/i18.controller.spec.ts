import { Test, TestingModule } from '@nestjs/testing';
import { I18Controller } from './i18.controller';
import { I18Service } from './i18.service';

describe('I18Controller', () => {
  let controller: I18Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [I18Controller],
      providers: [I18Service],
    }).compile();

    controller = module.get<I18Controller>(I18Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
