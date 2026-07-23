import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Application } from './application.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { FindApplicationsRequest } from './dto/find-applications';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: EntityRepository<Application>,
  ) {}
  private parseTagSafely(tag: string): unknown {
    try {
      return JSON.parse(tag);
    } catch {
      return [];
    }
  }
  async findAllAplication(query: FindApplicationsRequest) {
    const { page, limit, keywords, classify } = query;
    const skip = (page - 1) * limit;
    const queryBuilder =
      this.applicationRepository.createQueryBuilder('application');
    if (keywords) {
      queryBuilder.where({
        $or: [
          { 'application.name': { $like: `%${keywords}%` } },
          { 'application.description': { $like: `%${keywords}%` } },
          { 'application.tag': { $like: `%${keywords}%` } },
        ],
      });
    }
    if (classify !== 'all') {
      queryBuilder.andWhere({
        classify,
      });
    }
    const [application, cnt] = await queryBuilder
      .offset(skip)
      .limit(limit)
      .getResultAndCount();
    return {
      data: application.map((item) => {
        return {
          ...item,
          tag: this.parseTagSafely(item.tag),
        };
      }) as Application[],
      total: cnt,
    };
  }
}
