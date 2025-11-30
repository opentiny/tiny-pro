import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permission')
export class Permission {
  @ApiProperty({
    description: '权限ID'
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '权限简介'
  })
  @Column()
  desc: string;
  @ApiProperty({
    description: '权限名, 前端或外部服务使用'
  })
  @Column()
  name: string;
}
