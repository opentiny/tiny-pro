import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role';
import * as crypto from 'crypto';
import { ApiProperty } from '@nestjs/swagger';

export const encry = (value: string, salt: string) =>
  crypto.pbkdf2Sync(value, salt, 1000, 18, 'sha256').toString('hex');

@Entity('user')
export class User {
  @ApiProperty({description: '主键'})
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({description: '用户名'})
  @Column()
  name: string;

  @ApiProperty({description: '用户邮箱'})
  @Column()
  email: string;

  @ApiProperty({description: '用户密码'})
  @Column()
  password: string;

  @ApiProperty({description: '用户角色', type:()=>Role})
  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_role' })
  role: Role[];
  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  department: string;
  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  employeeType: string;
  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  probationStart: string;
  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  probationEnd: string;
  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  probationDuration: string;
  @ApiProperty({nullable: true})
  @Column({ type: 'timestamp', nullable: true })
  protocolStart: string;
  @ApiProperty({nullable: true})
  @Column({ type: 'timestamp', nullable: true })
  protocolEnd: string;
  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  address: string;
  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  status: number;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;
  @Column({ nullable: true })
  salt: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;
  @BeforeInsert()
  beforeInsert() {
    this.salt = crypto.randomBytes(4).toString('base64');
    this.password = encry(this.password, this.salt);
  }
}
