import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class Forbidden extends DomainError {
  constructor() {
    super({
      message: 'exception.common.FORBIDDEN',
      code: HttpStatus.FORBIDDEN,
    });
  }
}
