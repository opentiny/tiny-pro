import { PaginationMeta, PaginationQueryDto } from '@app/shared';
import { IsString } from 'class-validator';
import { RoleId } from 'src/role';
import type { UserId } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllUserRequest extends PaginationQueryDto {
  @IsString()
  name?: string;
  @IsString({ each: true })
  role?: RoleId[];
  @IsString()
  email?: string;
}

export class UserItem {
  @ApiProperty()
  id: UserId;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ nullable: true })
  department: string | null;
  @ApiProperty({ nullable: true })
  employeeType: string | null;
  @ApiProperty({ nullable: true })
  protocolStart: string | null;
  @ApiProperty({ nullable: true })
  protocolEnd: string | null;
  @ApiProperty({ nullable: true })
  probationEnd: string | null;
  @ApiProperty({ nullable: true })
  probationStart: string | null;
  @ApiProperty({ nullable: true })
  probationDuration: string | null;
  @ApiProperty({ nullable: true })
  address: string | null;
  @ApiProperty({ nullable: true })
  status: number | null;

  constructor(
    id: UserId,
    name: string,
    email: string,
    department: string | null,
    employeeType: string | null,
    protocolStart: string | null,
    protocolEnd: string | null,
    probationEnd: string | null,
    probationStart: string | null,
    probationDuration: string | null,
    address: string | null,
    status: number | null,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.department = department;
    this.employeeType = employeeType;
    this.protocolStart = protocolStart;
    this.protocolEnd = protocolEnd;
    this.probationEnd = probationEnd;
    this.probationStart = probationStart;
    this.probationDuration = probationDuration;
    this.address = address;
    this.status = status;
  }
}

export class UserList {
  item: UserItem[];
  meta: PaginationMeta;
  constructor(item: UserItem[], meta: PaginationMeta) {
    this.item = item;
    this.meta = meta;
  }
}
