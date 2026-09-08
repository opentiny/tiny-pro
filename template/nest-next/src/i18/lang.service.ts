import { Injectable } from '@nestjs/common';
import { Lang, I18n, LangId } from './i18.entites';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { CreateLang } from './dto/create-lang.dto';
import {
  I18nRecordExistsError,
  LangExistsError,
  LangNotExistsError,
} from './errors';
import { Lang as LangInfo } from './dto/lang-info.dto';

@Injectable()
export class LangService {
  constructor(
    @InjectRepository(I18n) private readonly i18: EntityRepository<I18n>,
    @InjectRepository(Lang) private readonly lang: EntityRepository<Lang>,
  ) {}
  findAll() {
    return this.lang.findAll();
  }
  async create({ name }: CreateLang) {
    const item = await this.lang.findOne({ name });
    if (item) {
      throw new LangExistsError();
    }
    const lang = this.lang.create({
      name,
    });
    return this.lang
      .upsert(lang)
      .then((item) => new LangInfo(item.id, item.name));
  }
  async findOne(id: LangId) {
    const lang = await this.lang.findOne({ id });
    if (!lang) {
      throw new LangNotExistsError();
    }
    return new LangInfo(lang.id, lang.name);
  }
  async update(id: LangId, data: Partial<CreateLang>) {
    const item = await this.findOne(id);
    if (!item) {
      throw new LangNotExistsError();
    }
    if (data.name) {
      item.name = data.name;
    }
    return this.lang
      .upsert(item)
      .then((item) => new LangInfo(item.id, item.name));
  }
  async remove(id: LangId) {
    const lang = await this.findOne(id);
    if (!lang) {
      throw new LangNotExistsError();
    }
    const i18Record = await this.i18.findOne({
      lang,
    });
    if (i18Record) {
      throw new I18nRecordExistsError();
    }
    await this.lang.nativeDelete({ id });
    return new LangInfo(id, lang.name);
  }
}
