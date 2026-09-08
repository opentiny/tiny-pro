import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LangService } from './lang.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Permission, Reject } from '@app/shared';
import { CreateLang } from './dto/create-lang.dto';
import { Lang, type LangId } from './i18.entites';

@Controller('/lang')
export class I18nLangController {
  constructor(private readonly langService: LangService) {}

  @ApiOperation({ summary: '创建一个语言' })
  @ApiCreatedResponse({ type: Lang })
  @Permission('lang::add')
  @Post('')
  createLang(@Body() data: CreateLang) {
    return this.langService.create(data);
  }

  @ApiOperation({ summary: '列出所有的语言' })
  @ApiCreatedResponse({ type: [Lang] })
  @Permission('lang::query')
  @Get('')
  findAllLang() {
    return this.langService.findAll();
  }

  @ApiOperation({ summary: '修改某个的语言' })
  @ApiOkResponse({ type: Lang })
  @ApiParam({
    name: 'id',
    description: '语言的数据库主键',
    type: String,
  })
  @Reject()
  @Permission('lang::update')
  @Patch(':id')
  updateLang(@Param('id') id: LangId, @Body() data: Partial<CreateLang>) {
    return this.langService.update(id, data);
  }

  @ApiOperation({ summary: '删除某个的语言' })
  @ApiOkResponse({ type: Lang })
  @ApiParam({
    name: 'id',
    description: '语言的数据库主键',
    type: String,
  })
  @Reject()
  @Permission('lang::remove')
  @Delete(':id')
  removeLang(@Param('id') id: LangId) {
    return this.langService.remove(id);
  }
}
