import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { I18n, I18nRecordId, Lang, LangId } from './i18.entites';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { CreateI18Dto } from './dto/create-i18.dto';
import {
  I18nNotFoundError,
  I18nRecordExistsError,
  LangNotExistsError,
} from './errors';
import { UpdateI18Dto } from './dto/update-i18.dto';

@Injectable()
export class I18Service {
  constructor(
    @InjectRepository(I18n) private readonly i18: EntityRepository<I18n>,
    @InjectRepository(Lang) private readonly lang: EntityRepository<Lang>,
  ) {}
  async getFormat(lang: string) {
    const data = await this.lang.find(
      { name: lang ? lang : undefined },
      {
        populate: ['i18n'],
      },
    );
    const ret: Record<string, Record<string, string>> = {};
    for (let i = 0; i < data.length; i++) {
      const { name, i18n } = data[i];
      ret[name] = {};
      for (let i = 0; i < i18n.length; i++) {
        const i18Item = i18n[i];
        ret[name][i18Item.key] = i18Item.content;
      }
    }
    return ret;
  }
  async create(dto: CreateI18Dto) {
    const { key, content, lang } = dto;
    const langRecord = await this.lang.findOne({ id: lang });
    if (!langRecord) {
      throw new LangNotExistsError();
    }
    const i18Item = await this.i18.findOne({
      key,
      lang: langRecord,
    });
    if (i18Item) {
      throw new I18nRecordExistsError();
    }
    const i18 = this.i18.create({
      key,
      content,
      lang: langRecord,
    });
    await this.i18.upsert(i18);
    return i18;
  }
  async has(key: string, langId: LangId) {
    return this.i18.findOne({
      key,
      lang: {
        id: langId,
      },
    });
  }
  async findAll(
    page?: number,
    limit?: number,
    all?: boolean,
    lang?: LangId[],
    content?: string,
    key?: string,
  ) {
    const where: FilterQuery<I18n> = {};
    if (lang && lang.length) {
      where.lang = { id: { $in: lang } };
    }
    if (content) {
      where.content = { $like: content };
    }
    if (key) {
      where.key = { $like: key };
    }
    if (all) {
      return this.i18.findAll({ where, populate: ['lang'] });
    }
    return this.i18.findAll({
      where,
      offset: page && limit ? (page - 1) * limit : 0,
      limit,
      populate: ['lang'],
    });
  }
  async findOne(id: I18nRecordId) {
    const item = await this.i18.findOne(
      {
        id,
      },
      { populate: ['lang'] },
    );
    if (!item) {
      throw new I18nNotFoundError();
    }
    return item;
  }
  async update(id: I18nRecordId, dto: UpdateI18Dto) {
    const item = await this.findOne(id);
    if (!item) {
      throw new I18nNotFoundError();
    }
    if (dto.content) {
      item.content = dto.content;
    }
    if (dto.key) {
      item.key = dto.key;
    }
    const langRecord = await this.lang.findOne({ id: dto.lang });
    if (!langRecord) {
      throw new LangNotExistsError();
    }
    item.lang = langRecord;
    await this.i18.upsert(item);
    return item;
  }
  async remove(id: I18nRecordId) {
    const item = await this.findOne(id);
    if (!item) {
      throw new I18nNotFoundError();
    }
    await this.i18.nativeDelete({ id });
  }
  async batchRemove(ids: I18nRecordId[]) {
    await this.i18.nativeDelete({ id: { $in: ids } });
  }
}
