import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class SessionExpired extends DomainError {
  constructor() {
    super({
      code: HttpStatus.UNAUTHORIZED,
      message: 'exception.auth.SESSION_EXPIRED',
    });
  }
}
