import { Test, TestingModule } from '@nestjs/testing';
import { I18Service } from './i18.service';

describe('I18Service', () => {
  let service: I18Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [I18Service],
    }).compile();

    service = module.get<I18Service>(I18Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
