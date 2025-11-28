import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TagEnum {
  DEFAULT = '',
  SUCCESS = 'success',
  INFO = 'info',
  DANGER = 'danger',
  WARNING = 'warning',
}

@Entity('application')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  icon: string;
  @Column()
  tag: string;
  @Column()
  classify: string;
}
