import { PartialType } from '@nestjs/swagger';
import { CreateI18Dto } from './create-i18.dto';

export class UpdateI18Dto extends PartialType(CreateI18Dto) {}
