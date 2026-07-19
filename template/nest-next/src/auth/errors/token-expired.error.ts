import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class TokenExpired extends DomainError {
  constructor(cause?: Error) {
    super({
      message: 'exception.auth.TOKEN_EXPIRED',
      code: HttpStatus.UNAUTHORIZED,
      cause,
    });
  }
}
