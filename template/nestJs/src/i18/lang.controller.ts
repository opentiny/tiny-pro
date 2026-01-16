import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { I18LangService } from './lang.service';
import { CreateLang } from './dto/create-lang.dto';
import { Permission } from '../public/permission.decorator';
import { Reject } from '../public/reject.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Lang } from '@app/models';

@Controller('/lang')
export class I18nLangController {
  constructor(private readonly langService: I18LangService) {}

  @ApiOperation({summary: '创建一个语言'})
  @ApiCreatedResponse({type: Lang})
  @Permission('lang::add')
  @Post('')
  createLang(@Body() data: CreateLang) {
    return this.langService.create(data);
  }

  @ApiOperation({summary: '列出所有的语言'})
  @ApiCreatedResponse({type: [Lang]})
  @Permission('lang::query')
  @Get('')
  findAllLang() {
    return this.langService.findAll();
  }

  @ApiOperation({summary: '修改某个的语言'})
  @ApiOkResponse({type: Lang})
  @ApiParam({
    name: 'id',
    description: '语言的数据库主键',
    type: Number
  })
  @Reject()
  @Permission('lang::update')
  @Patch(':id')
  updateLang(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateLang>
  ) {
    return this.langService.update(id, data);
  }

  @ApiOperation({summary: '修改某个的语言'})
  @ApiOkResponse({type: Lang})
  @ApiParam({
    name: 'id',
    description: '语言的数据库主键',
    type: Number
  })
  @Reject()
  @Permission('lang::remove')
  @Delete(':id')
  removeLang(@Param('id', ParseIntPipe) id: number) {
    return this.langService.remove(id);
  }
}
