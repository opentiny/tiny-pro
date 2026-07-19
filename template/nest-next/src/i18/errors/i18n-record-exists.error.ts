import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class I18nRecordExistsError extends DomainError {
  constructor() {
    super({
      message: 'exception.lang.DELETE_LANG_CONFLICT',
      code: HttpStatus.NOT_FOUND,
    });
  }
}
