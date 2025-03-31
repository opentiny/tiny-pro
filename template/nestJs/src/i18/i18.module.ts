import { Module } from '@nestjs/common';
import { I18Service } from './i18.service';
import { I18Controller } from './i18.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18, Lang } from '@app/models';
import { I18LangService } from './lang.service';
import { I18nLangController } from './lang.controller';

@Module({
  controllers: [I18Controller, I18nLangController],
  providers: [I18Service, I18LangService],
  imports: [TypeOrmModule.forFeature([Lang, I18])],
  exports: [I18Service, I18LangService],
})
export class I18Module {}
