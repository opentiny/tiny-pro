import { Application } from '@app/models';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../.generate/i18n.generated';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRep: Repository<Application>,
    private readonly i18n: I18nService<I18nTranslations>
  ) {}

  async findAllApplication(searchInfo: PaginationQueryDto) {
    const { page, limit, keywords, classify } = searchInfo;
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRep.createQueryBuilder('application');
    if (keywords) {
      const field = ['name', 'description', 'tag'];
      const conditions = field
        .map((item) => `application.${item} LIKE :keywords`)
        .join(' OR ');
      queryBuilder.where(`(${conditions})`, { keywords: `%${keywords}%` });
    }

    if (classify !== 'all') {
      queryBuilder.andWhere('application.classify= :classify', { classify });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map((item) => ({
        ...item,
        tag: this.parseTagSafely(item.tag),
      })),
      total,
    };
  }

  async createApplication(dto, isInit: boolean) {
    const { name, description, tag, icon, classify } = dto;
    const applicationInfo = this.applicationRep.findOne({
      where: { name },
    });
    if (isInit === true && (await applicationInfo)) {
      return applicationInfo;
    }
    if ((await applicationInfo) && isInit === false) {
      throw new HttpException(
        `exception.applicationInfo.exists：${name}`,
        HttpStatus.BAD_REQUEST
      );
    }
    return this.applicationRep.save({
      name,
      description,
      tag,
      icon,
      classify,
    });
  }

  private parseTagSafely(tag: string): unknown {
    try {
      return JSON.parse(tag);
    } catch {
      return [];
    }
  }
}
