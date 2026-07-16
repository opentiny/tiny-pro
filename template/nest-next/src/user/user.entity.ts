import * as crypto from 'crypto';
import {
  Entity,
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
  OneToMany,
  ManyToOne,
} from '@mikro-orm/decorators/legacy';
import { Cascade, Collection, type Opt } from '@mikro-orm/core';
import { v7 } from 'uuid';
import type { RoleId } from '../role';
import { RoleNotFound } from 'src/role/errors';

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

  @Property({ type: 'text' })
  name: string;

  @Property({ index: true, type: 'string' })
  email: string;

  @OneToMany({
    entity: () => UserRole,
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    eager: false,
    mappedBy: 'user',
  })
  role = new Collection<UserRole>(this);

  @Property({ index: true, type: 'string' })
  password: string;

  @Property({ type: 'text', nullable: true })
  department: Opt<string>;

  @Property({ type: 'text', nullable: true })
  employeeType: Opt<string>;

  @Property({ type: 'timestamp', nullable: true })
  probationStart: Opt<string>;

  @Property({ type: 'timestamp', nullable: true })
  probationEnd: Opt<string>;

  @Property({ type: 'text', nullable: true })
  probationDuration: Opt<string>;

  @Property({ type: 'timestamp', nullable: true })
  protocolStart: Opt<string>;

  @Property({ type: 'timestamp', nullable: true })
  protocolEnd: Opt<string>;

  @Property({ type: 'text', nullable: true })
  address: Opt<string>;

  @Property({ type: 'int', nullable: true })
  status: Opt<number>;

  @Property({ type: 'datetime' })
  createTime: Date & Opt;

  @Property({ type: 'datetime' })
  updateTime: Date & Opt;

  @Property({ type: 'text' })
  salt: Opt<string>;

  removeRole(roleId: RoleId) {
    const exists = this.role.find((ur) => ur.roleId === roleId);
    if (!exists) {
      throw new RoleNotFound();
    }
    this.role.remove(exists);
    return true;
  }
  hasRole(roleId: RoleId): boolean {
    return this.role.getItems().some((ur) => ur.roleId === roleId);
  }

  getRoleIds(): RoleId[] {
    return this.role.getItems().map((ur) => ur.roleId);
  }

  @BeforeCreate()
  beforeCreate() {
    this.salt = crypto.randomBytes(4).toString('base64');
    this.password = encry(this.password, this.salt);
    this.createTime = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updateTime = new Date();
  }

  verifyPassword(plain: string) {
    return encry(plain, this.salt) === this.password;
  }
  changePassword(newPassword: string) {
    this.password = encry(newPassword, this.salt);
  }
}

@Entity({ tableName: 'user_role' })
export class UserRole {
  @PrimaryKey({ type: 'uuid' })
  id: string = v7();
  @ManyToOne(() => User, {
    joinColumn: 'user_id',
  })
  user: User;
  @Property({ type: 'uuid', index: true })
  roleId: RoleId;

  constructor(user: User, roleId: RoleId) {
    this.id = v7();
    this.user = user;
    this.roleId = roleId;
  }
}
