import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: '应用主键',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '应用名',
  })
  @Column()
  name: string;
  @ApiProperty({
    description: '应用简介',
  })
  @Column()
  description: string;
  @ApiProperty({
    description: '应用图标',
  })
  @Column()
  icon: string;
  @ApiProperty({
    description: '应用Tag',
  })
  @Column()
  tag: string;
  // TODO: 没理解这是什么
  @ApiProperty()
  @Column()
  classify: string;
}
