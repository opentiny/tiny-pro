import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateI18Dto } from './dto/create-i18.dto';
import { UpdateI18Dto } from './dto/update-i18.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { I18, Lang } from '@app/models';
import { In, Like, Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class I18Service {
  private readonly COUNT_CACHE = 'i18::count::cache';
  constructor(
    @InjectRepository(I18) private readonly i18: Repository<I18>,
    @InjectRepository(Lang) private readonly lang: Repository<Lang>,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}

  async getFormat(lang: string) {
    const data = await this.lang.find({
      where: {
        name: lang === '' ? undefined : lang,
      },
      relations: ['i18'],
    });
    const ret: Record<string, Record<string, string>> = {};
    for (let i = 0; i < data.length; i++) {
      const { name, i18 } = data[i];
      ret[name] = {};
      for (let i = 0; i < i18.length; i++) {
        const i18Item = i18[i];
        ret[name][i18Item.key] = i18Item.content;
      }
    }
    return ret;
  }

  async create(createI18Dto: CreateI18Dto) {
    const { key, content, lang } = createI18Dto;
    const i18 = this.i18.create();
    const langRecord = await this.lang.findOne({
      where: {
        id: lang,
      },
    });
    if (!langRecord) {
      throw new HttpException(
        this.i18n.t('exception.lang.notExists', {
          args: { lang },
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    const i18Item = await this.i18.findOne({
      where: {
        key,
        lang: langRecord,
      },
    });
    if (i18Item) {
      throw new HttpException(
        this.i18n.t('exception.i18.exists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.BAD_REQUEST
      );
    }
    i18.content = content;
    i18.key = key;
    i18.lang = langRecord;
    const items = await this.i18.save(i18);
    return items;
  }
  async has(key: string, langId: number) {
    return this.i18.findOne({
      where: {
        key,
        lang: {
          id: langId,
        },
      },
    });
  }
  async findAll(
    page?: number,
    limit?: number,
    all?: boolean,
    lang?: number[],
    content?: string,
    key?: string
  ) {
    let count = 0;
    if (all) {
      count = await this.i18.count();
    }
    const where = {
      lang: lang && lang.length ? { id: In(lang) } : undefined,
      content: content ? Like(content) : undefined,
      key: key ? Like(key) : undefined,
    };
    if (page && limit) {
      return paginate<I18>(
        this.i18,
        {
          limit,
          page,
        },
        {
          relations: ['lang'],
          loadEagerRelations: true,
          where,
        }
      );
    } else {
      return paginate(
        this.i18,
        {
          limit: all ? count || process.env.PAGITION_LIMIT : limit,
          page: Number.isNaN(page) ? process.env.PAGITION_PAGE : page,
        },
        {
          relations: ['lang'],
          loadEagerRelations: true,
          where,
        }
      );
    }
  }

  async findOne(id: number) {
    const [item] = await this.i18.find({
      where: {
        id,
      },
      loadEagerRelations: true,
      relations: ['lang'],
    });
    if (!item) {
      throw new HttpException(
        this.i18n.t('exception.i18.notExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    return item;
  }

  async update(id: number, updateI18Dto: UpdateI18Dto) {
    const item = await this.findOne(id);
    item.content = updateI18Dto.content;
    item.key = updateI18Dto.key;
    const lang = await this.lang.findOne({
      where: {
        id: updateI18Dto.lang,
      },
    });
    if (!lang) {
      throw new HttpException(
        this.i18n.t('exception.lang.notExists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND
      );
    }
    item.lang = lang;
    return await this.i18.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.i18.remove(item);
    return item;
  }

  async batchRemove(ids: number[]) {
   const result = []
    for (const id of ids) {
     try {
      const item = await this.remove(id);
      result.push(item); 
     } catch (error) {
      console.log(`删除词条 ${id} 时出错`, error);
     }
    } 
    return result;
  }
}
