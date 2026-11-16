import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  findAll() {
    return this.projectRepository.find({ order: { startTime: 'DESC' } });
  }

  create(data: Partial<Project>) {
    const requiredFields: Array<keyof Project> = [
      'projectName',
      'projectCode',
      'owner',
    ];
    const missing = requiredFields.filter(
      (field) => !String(data[field] ?? '').trim()
    );
    if (missing.length) {
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}`
      );
    }
    const { id: _id, ...input } = data;
    return this.projectRepository.save(
      this.projectRepository.create({
        projectName: '',
        projectCode: '',
        projectStatus: '0',
        taskStatus: '0',
        department: '',
        startTime: '',
        endTime: '',
        priority: '1',
        owner: '',
        progress: 0,
        manHours: 0,
        budget: 0,
        teamSize: 0,
        goal: '',
        technology: '',
        partner: '',
        riskLevel: '',
        quality: '',
        remark: '',
        versions: [],
        ...input,
        id: randomUUID(),
      })
    );
  }

  async update(data: Partial<Project>) {
    const id = String(data.id ?? '');
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    Object.assign(project, data, { id: project.id });
    const requiredFields: Array<keyof Project> = [
      'projectName',
      'projectCode',
      'owner',
    ];
    const missing = requiredFields.filter(
      (field) => !String(project[field] ?? '').trim()
    );
    if (missing.length) {
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}`
      );
    }
    await this.projectRepository.save(project);
    return true;
  }

  async remove(id: string) {
    await this.projectRepository.delete(id);
    return true;
  }
}
