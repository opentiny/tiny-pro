import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { I18LangService } from '../lang.service';
import { I18, Lang } from '@app/models';
import { I18nContext, I18nService } from 'nestjs-i18n';

describe('I18LangService', () => {
  let service: I18LangService;
  let langRepositoryMock: any;
  let i18RepositoryMock: any;
  let i18nServiceMock: any;

  beforeEach(async () => {
    langRepositoryMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    i18RepositoryMock = {
      findOneBy: jest.fn(),
    };

    i18nServiceMock = {
      t: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        I18LangService,
        { provide: getRepositoryToken(Lang), useValue: langRepositoryMock },
        { provide: getRepositoryToken(I18), useValue: i18RepositoryMock },
        { provide: I18nService, useValue: i18nServiceMock },
      ],
    }).compile();
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      lang: undefined
    } as any)
    service = module.get<I18LangService>(I18LangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all languages', async () => {
      const languages = [{ id: 1, name: 'en' }];
      langRepositoryMock.find.mockResolvedValue(languages);

      const result = await service.findAll();

      expect(result).toEqual(languages);
      expect(langRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new language', async () => {
      const createLangDto = { name: 'en' };
      langRepositoryMock.findOneBy.mockResolvedValue(null);
      langRepositoryMock.create.mockReturnValue(createLangDto);
      langRepositoryMock.save.mockResolvedValue(createLangDto);

      const result = await service.create(createLangDto);

      expect(result).toEqual(createLangDto);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ name: 'en' });
      expect(langRepositoryMock.create).toHaveBeenCalled();
      expect(langRepositoryMock.save).toHaveBeenCalledWith(createLangDto);
    });

    it('should throw conflict exception if language already exists', async () => {
      const createLangDto = { name: 'en' };
      langRepositoryMock.findOneBy.mockResolvedValue(createLangDto);
      i18nServiceMock.t.mockReturnValue('Language already exists');

      await expect(service.create(createLangDto)).rejects.toThrow(HttpException);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ name: 'en' });
      expect(i18nServiceMock.t).toHaveBeenCalledWith('exception.lang.exists', {
        lang: undefined,
        args: { name: 'en' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a language by id', async () => {
      const language = { id: 1, name: 'en' };
      langRepositoryMock.findOneBy.mockResolvedValue(language);

      const result = await service.findOne(1);

      expect(result).toEqual(language);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('update', () => {
    it('should update a language', async () => {
      const language = { id: 1, name: 'en' };
      const updateData = { name: 'fr' };
      langRepositoryMock.findOneBy.mockResolvedValue(language);
      langRepositoryMock.save.mockResolvedValue({ ...language, ...updateData });

      const result = await service.update(1, updateData);

      expect(result).toEqual({ ...language, ...updateData });
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(langRepositoryMock.save).toHaveBeenCalledWith({
        ...language,
        ...updateData,
      });
    });

    it('should throw not found exception if language does not exist', async () => {
      langRepositoryMock.findOneBy.mockResolvedValue(null);
      i18nServiceMock.t.mockReturnValue('Language not found');

      await expect(service.update(1, { name: 'fr' })).rejects.toThrow(HttpException);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(i18nServiceMock.t).toHaveBeenCalledWith('exception.lang.notExistsCommon', {
        lang: undefined,
      });
    });
  });

  describe('remove', () => {
    it('should remove a language', async () => {
      const language = { id: 1, name: 'en' };
      langRepositoryMock.findOneBy.mockResolvedValue(language);
      i18RepositoryMock.findOneBy.mockResolvedValue(null);
      langRepositoryMock.remove.mockResolvedValue(language);

      const result = await service.remove(1);

      expect(result).toEqual(language);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(i18RepositoryMock.findOneBy).toHaveBeenCalledWith({ lang: language });
      expect(langRepositoryMock.remove).toHaveBeenCalledWith(language);
    });

    it('should throw not found exception if language does not exist', async () => {
      langRepositoryMock.findOneBy.mockResolvedValue(null);
      i18nServiceMock.t.mockReturnValue('Language not found');

      await expect(service.remove(1)).rejects.toThrow(HttpException);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(i18nServiceMock.t).toHaveBeenCalledWith('exception.lang.notExistsCommon', {
        lang: undefined,
      });
    });

    it('should throw conflict exception if language is in use', async () => {
      const language = { id: 1, name: 'en' };
      langRepositoryMock.findOneBy.mockResolvedValue(language);
      i18RepositoryMock.findOneBy.mockResolvedValue({ lang: language });
      i18nServiceMock.t.mockReturnValue('Language is in use');

      await expect(service.remove(1)).rejects.toThrow(HttpException);
      expect(langRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(i18RepositoryMock.findOneBy).toHaveBeenCalledWith({ lang: language });
      expect(i18nServiceMock.t).toHaveBeenCalledWith('exception.lang.DELETE_LANG_CONFLICT', {
        lang: undefined,
        args: { name: 'en' },
      });
    });
  });
});