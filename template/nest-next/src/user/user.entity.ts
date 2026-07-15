import * as crypto from 'crypto';
import {
  Entity,
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
  OneToMany,
} from '@mikro-orm/decorators/legacy';
import { Cascade, Collection, Opt } from '@mikro-orm/core';
import { v7 } from 'uuid';
import type { RoleId } from '../role';

export const encry = (value: string, salt: string) =>
  crypto.pbkdf2Sync(value, salt, 1000, 18, 'sha256').toString('hex');

export type UserId = string & { readonly __brand: unique symbol };
export type Password = string & { readonly __brand: unique symbol };

export const createUserId = () => v7() as UserId;
export const toUserId = (id: string) => id as UserId;

@Entity({ tableName: 'user' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: UserId & Opt = createUserId();

  @Property()
  name: string;

  @Property({ index: true, type: 'text' })
  email: string;

  @OneToMany(() => UserRole, (ur) => ur.userId, {
    hidden: true,
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  role = new Collection<UserRole>(this);

  @Property({ index: true, type: 'text' })
  password: string;

  @Property({ nullable: true })
  department: string;

  @Property({ nullable: true })
  employeeType: string;

  @Property({ type: 'timestamp', nullable: true })
  probationStart: string;

  @Property({ type: 'timestamp', nullable: true })
  probationEnd: string;

  @Property({ nullable: true })
  probationDuration: string;

  @Property({ type: 'timestamp', nullable: true })
  protocolStart: string;

  @Property({ type: 'timestamp', nullable: true })
  protocolEnd: string;

  @Property({ nullable: true })
  address: string;

  @Property({ nullable: true })
  status: number;

  @Property({ type: 'datetime' })
  createTime: Date & Opt;

  @Property({ type: 'datetime' })
  updateTime: Date & Opt;

  @Property()
  salt: string;

  @Property({ type: 'timestamp' })
  create_time: Date & Opt;
  @Property({ type: 'timestamp' })
  update_time: Date & Opt;

  @BeforeCreate()
  beforeCreate() {
    this.salt = crypto.randomBytes(4).toString('base64');
    this.password = encry(this.password, this.salt);
    this.createTime = new Date();
    this.create_time = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updateTime = new Date();
    this.update_time = new Date();
  }

  verifyPassword(plain: string) {
    return encry(plain, this.salt) === this.password;
  }
  changePassword(newPassword: string) {
    this.password = encry(newPassword, this.salt);
  }

  assignRole(roleId: RoleId) {
    const hasRole = this.role.getItems().some((r) => r.roleId === roleId);
    if (!hasRole) {
      const userRole = new UserRole(this.id, roleId);
      this.role.add(userRole);
    }
  }

  removeRole(roleId: RoleId) {
    const roleToRemove = this.role.getItems().find((r) => r.roleId === roleId);
    if (roleToRemove) {
      this.role.remove(roleToRemove);
    }
  }
}

@Entity({ tableName: 'user_role' })
export class UserRole {
  @PrimaryKey({ type: 'uuid' })
  id: string = v7();
  @Property({ type: 'uuid', index: true })
  userId: UserId;
  @Property({ type: 'uuid', index: true })
  roleId: RoleId;

  constructor(userId: UserId, roleId: RoleId) {
    this.id = v7();
    this.userId = userId;
    this.roleId = roleId;
  }
}
