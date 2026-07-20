import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class I18nNotFoundError extends DomainError {
  constructor() {
    super({
      message: 'exception.i18.NOT_FOUND',
      code: HttpStatus.NOT_FOUND,
    });
  }
}
