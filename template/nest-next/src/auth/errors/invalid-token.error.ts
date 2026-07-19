import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class InvalidToken extends DomainError {
  constructor() {
    super({
      message: 'exception.auth.INVALID_TOKEN',
      code: HttpStatus.UNAUTHORIZED,
    });
  }
}
