import { Test, TestingModule } from '@nestjs/testing';
import { I18Service } from '../i18.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18, Lang } from '@app/models';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { HttpException } from '@nestjs/common';

describe('I18Service', () => {
  let service: I18Service;
  let i18RepositoryMock: any;
  let langRepositoryMock: any;
  let i18nServiceMock: any;

  beforeEach(async () => {
    i18RepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    };

    langRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    i18nServiceMock = {
      t: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        I18Service,
        { provide: getRepositoryToken(I18), useValue: i18RepositoryMock },
        { provide: getRepositoryToken(Lang), useValue: langRepositoryMock },
        { provide: I18nService, useValue: i18nServiceMock },
      ],
    }).compile();
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      lang: ''
    } as any)
    service = module.get<I18Service>(I18Service);
  });

  it('should get formatted data', async () => {
    langRepositoryMock.find.mockResolvedValue([
      {
        name: 'en',
        i18: [{ key: 'greeting', content: 'Hello' }],
      },
    ]);

    const result = await service.getFormat('en');
    expect(result).toEqual({ en: { greeting: 'Hello' } });
    expect(langRepositoryMock.find).toHaveBeenCalledWith({
      where: { name: 'en' },
      relations: ['i18'],
    });
  });

  it('should throw an error if lang does not exist when creating', async () => {
    langRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.create({ key: 'greeting', content: 'Hello', lang: 1 })
    ).rejects.toThrow(HttpException);

    expect(i18nServiceMock.t).toHaveBeenCalledWith('exception.lang.notExists', {
      args: { lang: 1 },
      lang: expect.any(String),
    });
  });

  it('should create a new i18 record', async () => {
    const langRecord = { id: 1 };
    langRepositoryMock.findOne.mockResolvedValue(langRecord);
    i18RepositoryMock.findOne.mockResolvedValue(null);
    i18RepositoryMock.create.mockReturnValue({ key: 'greeting', content: 'Hello', lang: langRecord });
    i18RepositoryMock.save.mockResolvedValue({ id: 1, key: 'greeting', content: 'Hello', lang: langRecord });

    const result = await service.create({ key: 'greeting', content: 'Hello', lang: 1 });

    expect(result).toEqual({ id: 1, key: 'greeting', content: 'Hello', lang: langRecord });
    expect(i18RepositoryMock.create).toHaveBeenCalledWith();
    expect(i18RepositoryMock.save).toHaveBeenCalled();
  });

  it('should find one i18 record', async () => {
    const i18Record = { id: 1, key: 'greeting', content: 'Hello', lang: { id: 1 } };
    i18RepositoryMock.find.mockResolvedValue([i18Record]);

    const result = await service.findOne(1);

    expect(result).toEqual(i18Record);
    expect(i18RepositoryMock.find).toHaveBeenCalledWith({
      where: { id: 1 },
      loadEagerRelations: true,
      relations: ['lang'],
    });
  });

  it('should throw an error if i18 record does not exist when finding one', async () => {
    i18RepositoryMock.find.mockResolvedValue([]);

    await expect(service.findOne(1)).rejects.toThrow(HttpException);

    expect(i18nServiceMock.t).toHaveBeenCalledWith('exception.i18.notExists', {
      lang: expect.any(String),
    });
  });

  it('should update an i18 record', async () => {
    const i18Record = { id: 1, key: 'greeting', content: 'Hello', lang: { id: 1 } };
    const langRecord = { id: 2 };
    i18RepositoryMock.find.mockResolvedValue([i18Record]);
    langRepositoryMock.findOne.mockResolvedValue(langRecord);
    i18RepositoryMock.save.mockResolvedValue({ ...i18Record, key: 'farewell', content: 'Goodbye', lang: langRecord });

    const result = await service.update(1, { key: 'farewell', content: 'Goodbye', lang: 2 });

    expect(result).toEqual({ ...i18Record, key: 'farewell', content: 'Goodbye', lang: langRecord });
    expect(i18RepositoryMock.save).toHaveBeenCalled();
  });

  it('should remove an i18 record', async () => {
    const i18Record = { id: 1, key: 'greeting', content: 'Hello', lang: { id: 1 } };
    i18RepositoryMock.find.mockResolvedValue([i18Record]);
    i18RepositoryMock.remove.mockResolvedValue(i18Record);

    const result = await service.remove(1);

    expect(result).toEqual(i18Record);
    expect(i18RepositoryMock.remove).toHaveBeenCalledWith(i18Record);
  });

});