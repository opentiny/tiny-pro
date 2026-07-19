import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class LangExistsError extends DomainError {
  constructor() {
    super({
      message: 'exception.lang.EXISTS',
      code: HttpStatus.BAD_REQUEST,
    });
  }
}
