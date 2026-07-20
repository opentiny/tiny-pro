import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { I18Service } from './i18.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { I18 } from './dto/i18n-info.dto';
import { Permission, Reject } from '@app/shared';
import { CreateI18Dto } from './dto/create-i18.dto';
import { BatchRemoveI18Records } from './dto/batch-remove-i18.dto';
import { UpdateI18Dto } from './dto/update-i18.dto';
import type { I18nRecordId, LangId } from './i18.entites';
import { FindAllI18n } from './dto/find-all-i18n.dto';

@Controller('i18')
export class I18Controller {
  constructor(private readonly i18Service: I18Service) {}

  @ApiOperation({ summary: '创建一个国际化词条' })
  @ApiCreatedResponse({ type: I18 })
  @Permission('i18n::add')
  @Post()
  create(@Body() createI18Dto: CreateI18Dto) {
    return this.i18Service.create(createI18Dto);
  }

  @ApiOperation({ summary: '获取格式化后的国际化词条树' })
  @ApiOkResponse({
    type: Object,
    description:
      '获取经过格式化后的国际化词条树. 具体签名如下`Record<lang, Record<i18-key, i18-content>>`',
  })
  @Get('format')
  getFormat(@Query('lang') lang: string) {
    return this.i18Service.getFormat(lang);
  }

  @ApiOperation({ summary: '查询国际化' })
  @ApiQuery({ name: 'page', description: '页码' })
  @ApiQuery({ name: 'limit', description: '页大小' })
  @ApiQuery({
    name: 'all',
    description:
      '是否全部获取, 如果不未0则忽略page与limit, 返回所有的国际化字段',
  })
  @ApiQuery({ name: 'lang', description: '语言ID' })
  @ApiQuery({
    name: 'key',
    description: '国际化字段的键, 如果设定则表示按照键来模糊查找',
  })
  @ApiQuery({
    name: 'content',
    description: '国际化字段的值, 如果设定则表示按照值来模糊查找',
  })
  @ApiOkResponse({ type: FindAllI18n })
  @Permission('i18n::query')
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
    @Query('all', ParseIntPipe) all?: number,
    @Query('lang', new DefaultValuePipe([]), ParseArrayPipe) lang?: LangId[],
    @Query('key') key?: string,
    @Query('content') content?: string,
  ) {
    return this.i18Service.findAll(
      page,
      limit,
      Boolean(all),
      lang,
      content,
      key,
    );
  }

  @ApiOperation({ summary: '根据数据库ID获取国际化字段' })
  @ApiParam({
    type: Number,
    name: 'id',
    description: '国际化字段数据库ID',
  })
  @ApiOkResponse({
    type: I18,
  })
  @Permission('i18n::query')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: I18nRecordId) {
    return this.i18Service.findOne(id);
  }

  @ApiOperation({ summary: '根据数据库ID更新国际化字段' })
  @ApiParam({
    type: Number,
    name: 'id',
    description: '国际化字段数据库ID',
  })
  @ApiOkResponse({
    type: I18,
  })
  @Reject()
  @Permission('i18n::update')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: I18nRecordId,
    @Body() updateI18Dto: UpdateI18Dto,
  ) {
    return this.i18Service.update(id, updateI18Dto);
  }

  @ApiOperation({ summary: '根据数据库ID删除国际化字段' })
  @ApiParam({
    type: Number,
    name: 'id',
    description: '国际化字段数据库ID',
  })
  @ApiOkResponse({
    type: I18,
  })
  @Reject()
  @Permission('i18n::remove')
  @Delete(':id')
  remove(@Param('id') id: I18nRecordId) {
    return this.i18Service.remove(id);
  }

  @ApiOperation({ summary: '根据数据库ID批量删除国际化字段' })
  @ApiCreatedResponse({
    type: [I18],
  })
  @Reject()
  @Permission('i18n::batch-remove')
  @Post('/batch')
  batchRemove(@Body() body: I18nRecordId[]) {
    return this.i18Service.batchRemove(body);
  }
}
