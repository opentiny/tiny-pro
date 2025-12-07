import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission';
import { Menu } from './menu';
import { ApiProperty } from '@nestjs/swagger';

@Entity('role')
export class Role {
  @ApiProperty({
    description: '角色ID'
  })
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    description: '角色名称 (人类可读)'
  })
  @Column()
  name: string;

  @ApiProperty({
    description: '角色所拥有的权限',
    type: [Permission]
  })
  @ManyToMany(() => Permission, {
    onUpdate: 'CASCADE',
  })
  @JoinTable({ name: 'role_permission' })
  permission: Permission[];

  @ApiProperty({
    description: '角色所拥有的菜单',
    type: [Menu]
  })
  @ManyToMany(() => Menu)
  @JoinTable({ name: 'role_menu' })
  menus: Menu[];
}
