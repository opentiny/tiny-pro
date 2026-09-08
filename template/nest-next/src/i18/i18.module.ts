import { Module } from '@nestjs/common';
import { I18Service } from './i18.service';
import { I18Controller } from './i18.controller';
import { I18nLangController } from './lang.controller';
import { LangService } from './lang.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { I18n, Lang } from './i18.entites';

@Module({
  imports: [MikroOrmModule.forFeature([Lang, I18n])],
  controllers: [I18Controller, I18nLangController],
  providers: [I18Service, LangService],
})
export class I18Module {}
