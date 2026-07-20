import { Controller } from '@nestjs/common';
import { I18Service } from './i18.service';

@Controller('i18')
export class I18Controller {
  constructor(private readonly i18Service: I18Service) {}
}
