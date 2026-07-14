import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { PermissionId } from '../../permission';
import { MenuId } from 'src/menu';

export class CreateRoleDto {
  @ApiProperty({
    description: '角色名',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: '权限ID',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  permissionIds: PermissionId[] = [];
  @ApiProperty({
    description: '菜单ID',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  menuIds: MenuId[] = [];
}
