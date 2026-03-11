import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    description: '排序'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  order: number;
  @ApiProperty({
    description: '菜单类型'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  menuType: string;
  @ApiProperty({
    description: '菜单key'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;
  @ApiProperty({
    description: '路由路径'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  path: string;
  @ApiProperty({
    description: '组件路径'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  component: string;
  @ApiProperty({
    description: '菜单图标',
    required: false,
  })
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('validation.TYPE_ERROR', {type: 'string'}),
  })
  icon: string;
  @ApiProperty({
    description: '菜单国际化key'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  locale: string;

  @ApiProperty({
    description: '父级id, 必须保证parentId存在',
    nullable: true
  })
  parentId: number | null;
}
