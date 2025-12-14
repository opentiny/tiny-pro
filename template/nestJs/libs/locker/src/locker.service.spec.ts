import { Test, TestingModule } from '@nestjs/testing';
import { LockerService } from './locker.service';
import { RedisService } from '../../redis/redis.service';

describe('LockerService', () => {
  let service: LockerService;

  beforeEach(async () => {
     const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockerService,
        {
          provide: RedisService,
          useValue: {
            getRedis: jest.fn().mockReturnValue({
              set: jest.fn(),
              eval: jest.fn(),
              exists: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LockerService>(LockerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
