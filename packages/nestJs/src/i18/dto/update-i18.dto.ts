import { PartialType } from '@nestjs/mapped-types';
import { CreateI18Dto } from './create-i18.dto';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateI18Dto extends PartialType(CreateI18Dto) {}
