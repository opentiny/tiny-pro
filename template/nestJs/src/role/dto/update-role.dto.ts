import { CreateRoleDto } from './create-role.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty()
  id: number;
}
