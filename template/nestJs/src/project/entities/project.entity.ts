import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
