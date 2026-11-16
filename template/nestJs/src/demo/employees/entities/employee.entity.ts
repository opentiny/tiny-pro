import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('employee')
export class Employee {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  employeeNo: string;

  @Column()
  department: string;

  @Column()
  departmentLevel: string;

  @Column()
  status: string;

  @Column()
  workbenchName: string;

  @Column()
  project: string;

  @Column()
  type: string;

  @Column()
  address: string;

  @Column()
  roles: string;

  @Column()
  lastUpdateUser: string;

  @Column()
  createTime: string;

  @Column({ default: '' })
  rank: string;

  @Column({ default: '' })
  description: string;
}
