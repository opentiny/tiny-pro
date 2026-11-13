import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import type { EmployeeQueryBody, EmployeeSearchInfo } from './dto/employee-query.dto';
import { Employee } from './entities/employee.entity';

// 分页上限：前端页大小选项最大 50，这里留有余量，防止一次拉取拖垮数据库
const MAX_PAGE_SIZE = 100;

// 关键字按空格分词，在所有文本字段中模糊匹配（AND 关系）；
// 过滤器支持 values 精确匹配（name/employeeNo 模糊）以及 start/end 时间范围
const TEXT_FIELDS: Array<keyof Employee> = [
  'name',
  'employeeNo',
  'department',
  'departmentLevel',
  'workbenchName',
  'project',
  'type',
  'address',
  'roles',
  'lastUpdateUser',
  'createTime',
  'status',
  'rank',
  'description',
];

const FILTER_FIELDS: Array<keyof Employee> = [
  'name',
  'employeeNo',
  'departmentLevel',
  'department',
  'status',
  'workbenchName',
  'project',
  'type',
  'address',
  'roles',
  'lastUpdateUser',
];

// createTime 不作为枚举筛选字段，但支持 start/end 时间范围筛选
const RANGE_FIELDS = new Set<string>([
  ...FILTER_FIELDS,
  'createTime',
]);

const FUZZY_FIELDS = new Set<string>(['name', 'employeeNo']);

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
  ) {}

  async queryPage(body: EmployeeQueryBody = {}) {
    const pageIndex = normalizePageValue(body.pageIndex, 1);
    const pageSize = Math.min(normalizePageValue(body.pageSize, 10), MAX_PAGE_SIZE);
    const offset = (pageIndex - 1) * pageSize;
    if (!Number.isSafeInteger(offset)) {
      return { total: 0, data: [], filters: await this.buildFilterOptions() };
    }
    const qb = this.applySearch(
      this.employeeRepository.createQueryBuilder('employee'),
      body.searchInfo
    );
    const [data, total] = await qb
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();
    return {
      total,
      data,
      filters: await this.buildFilterOptions(),
    };
  }

  findOne(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  async update(data: Partial<Employee>): Promise<boolean> {
    const employee = await this.findOne(String(data?.id ?? ''));
    if (!employee) {
      return false;
    }
    (Object.keys(employee) as Array<keyof Employee>).forEach((key) => {
      if (key === 'id') {
        return;
      }
      const value = data[key];
      if (typeof value === 'string') {
        (employee as Record<keyof Employee, string>)[key] = value;
      }
    });
    await this.employeeRepository.save(employee);
    return true;
  }

  async remove(id: string): Promise<boolean> {
    await this.employeeRepository.delete(id);
    return true;
  }

  private applySearch(
    qb: SelectQueryBuilder<Employee>,
    searchInfo?: EmployeeSearchInfo
  ) {
    const keyword = typeof searchInfo?.keyword === 'string' ? searchInfo.keyword : '';
    const tokens = keyword.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((token, index) => {
      const param = `keyword${index}`;
      qb.andWhere(
        new Brackets((sub) => {
          TEXT_FIELDS.forEach((field, fieldIndex) => {
            const clause = `employee.${String(field)} LIKE :${param}`;
            if (fieldIndex === 0) {
              sub.where(clause, { [param]: `%${token}%` });
            } else {
              sub.orWhere(clause, { [param]: `%${token}%` });
            }
          });
        })
      );
    });
    (searchInfo?.filters ?? []).forEach((filter, index) => {
      const field = filter.field;
      // field 先经白名单校验，避免拼接 SQL 时被注入
      if (!field || !RANGE_FIELDS.has(field)) {
        return;
      }
      if (filter.start || filter.end) {
        if (filter.start && filter.end) {
          qb.andWhere(`employee.${field} BETWEEN :start${index} AND :end${index}`, {
            [`start${index}`]: filter.start,
            [`end${index}`]: filter.end,
          });
        } else if (filter.start) {
          qb.andWhere(`employee.${field} >= :start${index}`, {
            [`start${index}`]: filter.start,
          });
        } else {
          qb.andWhere(`employee.${field} <= :end${index}`, {
            [`end${index}`]: filter.end,
          });
        }
        return;
      }
      const values = (filter.values ?? [])
        .map((value) => String(value).trim())
        .filter(Boolean);
      if (!values.length) {
        return;
      }
      if (FUZZY_FIELDS.has(field)) {
        qb.andWhere(
          new Brackets((sub) => {
            values.forEach((value, valueIndex) => {
              const param = `value${index}_${valueIndex}`;
              const clause = `employee.${field} LIKE :${param}`;
              if (valueIndex === 0) {
                sub.where(clause, { [param]: `%${value}%` });
              } else {
                sub.orWhere(clause, { [param]: `%${value}%` });
              }
            });
          })
        );
      } else {
        qb.andWhere(`employee.${field} IN (:...values${index})`, {
          [`values${index}`]: values,
        });
      }
    });
    return qb;
  }

  private async buildFilterOptions() {
    const filters: Record<string, string[]> = {};
    for (const field of FILTER_FIELDS) {
      const rows: Array<{ value: string }> = await this.employeeRepository
        .createQueryBuilder('employee')
        .select(`employee.${field}`, 'value')
        .distinct(true)
        .getRawMany();
      filters[field] = rows
        .map((row) => row.value)
        .filter((value) => value != null)
        .sort((a, b) => String(a).localeCompare(String(b), 'zh'));
    }
    const range: { min: string | null; max: string | null } =
      await this.employeeRepository
        .createQueryBuilder('employee')
        .select('MIN(employee.createTime)', 'min')
        .addSelect('MAX(employee.createTime)', 'max')
        .getRawOne();
    return {
      ...filters,
      createTime: { min: range?.min ?? '', max: range?.max ?? '' },
    };
  }
}

// 分页参数归一化：非有限数或非整数回退默认值，整数向下取整并钳制下界
function normalizePageValue(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.max(1, Math.floor(num));
}
