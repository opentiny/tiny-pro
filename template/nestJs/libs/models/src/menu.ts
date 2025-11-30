import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu')
export class Menu {

  @ApiProperty({
    description: '菜单ID'
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '菜单名'
  })
  @Column()
  name: string;

  @ApiProperty({
    description: '菜单序列'
  })
  @Column()
  order: number;
  @ApiProperty({
    description: '菜单父级',
    nullable: true
  })
  @Column({ nullable: true })
  parentId: number;

  @ApiProperty({
    description: '菜单类型',
  })
  @Column()
  menuType: string;
  @ApiProperty({
    description: '菜单图标',
  })
  @Column({ nullable: true })
  icon: string;

  @ApiProperty({
    description: '菜单对应的前端组件',
  })
  @Column()
  component: string;

  @ApiProperty({
    description: '菜单路由地址',
  })
  @Column()
  path: string;

  @ApiProperty({
    description: '菜单国际化key',
  })
  @Column()
  locale: string;
}
