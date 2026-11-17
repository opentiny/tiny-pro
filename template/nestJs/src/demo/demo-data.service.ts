import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import {
  BoardHome,
  BoardWorkPlan,
  BoardWorkPractice,
  BoardWorkPracticeChart,
  BoardWorkTraining,
  DemoJsonData,
  FormAdvance,
  FormBase,
  FormStep,
  FormSubmission,
  ProfileDetail,
  UserInfo,
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

interface UserCenterData {
  tableData: UserCenterRow[];
  chartData: unknown[];
}

interface WorkSelectData {
  options1: number[];
  options2: number[];
  options3: number[];
}

@Injectable()
export class DemoDataService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>
  ) {}

  private async get<T>(entity: EntityTarget<DemoJsonData>): Promise<T> {
    const repository = this.dataSource.getRepository(entity);
    const record = await repository.findOne({ where: { id: 1 } });
    if (!record) {
      throw new NotFoundException(
        `Demo data not found: ${repository.metadata.tableName}`
      );
    }
    return record.data as T;
  }

  getBoardHome() {
    return this.get(BoardHome);
  }

  getWorkPlan() {
    return this.get(BoardWorkPlan);
  }

  getWorkPractice() {
    return this.get(BoardWorkPractice);
  }

  getWorkTraining() {
    return this.get(BoardWorkTraining);
  }

  getWorkPracticeChart() {
    return this.get<WorkSelectData>(BoardWorkPracticeChart);
  }

  getBaseForm() {
    return this.get(FormBase);
  }

  getStepForm() {
    return this.get(FormStep);
  }

  getAdvanceForm() {
    return this.get(FormAdvance);
  }

  getProfileDetail() {
    return this.get(ProfileDetail);
  }

  async getUserCenterData(query: UserCenterQuery = {}) {
    const data = await this.get<UserCenterData>(UserInfo);
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
      descending ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time)
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
