import { I18, Lang } from '@app/models';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLang } from './dto/create-lang.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../.generate/i18n.generated';

@Injectable()
export class I18LangService {
  constructor(
    @InjectRepository(I18) private readonly i18: Repository<I18>,
    @InjectRepository(Lang) private readonly lang: Repository<Lang>,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}
  findAll() {
    return this.lang.find();
  }
  async create({ name }: CreateLang) {
    const item = await this.lang.findOneBy({ name });
    if (item) {
      throw new HttpException(
        this.i18n.t('exception.lang.exists', {
          lang: I18nContext.current().lang,
          args: {
            name,
          },
        }),
        HttpStatus.CONFLICT
      );
    }
    const lang = this.lang.create();
    lang.name = name;
    return this.lang.save(lang);
  }
  findOne(id: number) {
    return this.lang.findOneBy({ id });
  }
  async update(id: number, data: Partial<CreateLang>) {
    const item = await this.findOne(id);
    if (!item) {
      throw new HttpException(
        this.i18n.t('exception.lang.notExistsCommon', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    item.name = data.name;
    return await this.lang.save(item);
  }
  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) {
      throw new HttpException(
        this.i18n.t('exception.lang.notExistsCommon', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    const i18Record = await this.i18.findOneBy({ lang: item });
    if (i18Record) {
      throw new HttpException(
        this.i18n.t('exception.lang.DELETE_LANG_CONFLICT', {
          lang: I18nContext.current().lang,
          args: {
            name: item.name,
          },
        }),
        HttpStatus.CONFLICT
      );
    }
    return await this.lang.remove(item);
  }
}
