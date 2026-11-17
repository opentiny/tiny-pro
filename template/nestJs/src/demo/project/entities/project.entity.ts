import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface ProjectVersion {
  id: string;
  version: string;
  date: string;
  content: string;
  status: string;
  owner: string;
}

@Entity('project')
export class Project {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column()
  projectName: string;

  @Column()
  projectCode: string;

  @Column()
  projectStatus: string;

  @Column()
  taskStatus: string;

  @Column()
  department: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  priority: string;

  @Column()
  owner: string;

  @Column('int', { default: 0 })
  progress: number;

  @Column('int', { default: 0 })
  manHours: number;

  @Column('int', { default: 0 })
  budget: number;

  @Column('int', { default: 0 })
  teamSize: number;

  @Column('varchar', { length: 1000, default: '' })
  goal: string;

  @Column('varchar', { length: 500, default: '' })
  technology: string;

  @Column('varchar', { length: 500, default: '' })
  partner: string;

  @Column('varchar', { length: 16, default: '' })
  riskLevel: string;

  @Column('varchar', { length: 1000, default: '' })
  quality: string;

  @Column('varchar', { length: 1000, default: '' })
  remark: string;

  @Column('json', { nullable: true })
  versions: ProjectVersion[] | null;
}
