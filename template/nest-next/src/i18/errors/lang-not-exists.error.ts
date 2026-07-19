import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class LangNotExistsError extends DomainError {
  constructor() {
    super({
      message: 'exception.lang.NOT_EXISTS',
      code: HttpStatus.NOT_FOUND,
    });
  }
}
