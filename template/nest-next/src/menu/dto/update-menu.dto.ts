import { CreateMenuDto } from './create-menu.dto';
import { IsNotEmpty } from 'class-validator';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import type { MenuId } from '../menu.entity';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ description: '菜单主键ID' })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  id: MenuId;
}

export class UpdateMenuResponse {
  @ApiProperty({ description: '菜单主键ID' })
  id: MenuId;
  constructor(props: UpdateMenuResponse) {
    Object.assign(this, props);
  }
}
