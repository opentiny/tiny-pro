import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  DemoData,
  FormSubmission,
} from './entities/demo-data.entity';

interface UserCenterQuery {
  sort?: number;
  startTime?: string;
  endTime?: string;
  filterStatus?: string[];
  filterType?: string[];
}

interface UserCenterRow {
  time: string;
  type: string;
  status: string;
  [key: string]: unknown;
}

@Injectable()
export class DemoDataService {
  constructor(
    @InjectRepository(DemoData)
    private readonly demoDataRepository: Repository<DemoData>,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>
  ) {}

  async get<T>(key: string): Promise<T> {
    const record = await this.demoDataRepository.findOne({ where: { key } });
    if (!record) {
      throw new NotFoundException(`Demo data not found: ${key}`);
    }
    return record.data as T;
  }

  async getUserCenterData(query: UserCenterQuery = {}) {
    const data = await this.get<{
      tableData: UserCenterRow[];
      chartData: unknown[];
    }>('user-center');
    let tableData = data.tableData.map((item) => ({ ...item }));
    if (query.filterType?.length) {
      tableData = tableData.filter((item) =>
        query.filterType.includes(item.type.slice(-1))
      );
    }
    if (query.filterStatus?.length) {
      tableData = tableData.filter((item) =>
        query.filterStatus.includes(item.status.slice(-1))
      );
    }
    if (query.startTime) {
      tableData = tableData.filter(
        (item) => item.time.slice(0, 10) >= query.startTime
      );
    }
    if (query.endTime) {
      tableData = tableData.filter(
        (item) => item.time.slice(0, 10) <= query.endTime
      );
    }
    const descending = query.sort === 2 || query.sort === 4;
    tableData.sort((a, b) =>
      descending
        ? b.time.localeCompare(a.time)
        : a.time.localeCompare(b.time)
    );
    return {
      chartData: data.chartData,
      tableData,
      taskSummary: ['A', 'B', 'C', 'D'].map((status) => ({
        status,
        value: tableData.filter((item) => item.status.slice(-1) === status)
          .length,
      })),
    };
  }

  async saveSubmission(payload: Record<string, unknown>) {
    await this.formSubmissionRepository.save({
      id: randomUUID(),
      payload,
      createTime: new Date().toISOString(),
    });
  }
}
