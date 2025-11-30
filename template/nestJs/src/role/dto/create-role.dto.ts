import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: '角色名'
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: '权限ID',
    type: [Number]
  })
  @IsArray()
  @IsNotEmpty()
  permissionIds: number[];
  @ApiProperty({
    description: '菜单ID',
    type: [Number]
  })
  @IsArray()
  @IsNotEmpty()
  menuIds: number[];
}
