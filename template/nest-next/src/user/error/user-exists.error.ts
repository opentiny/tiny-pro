import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class UserExistsError extends DomainError {
  constructor(email: string) {
    super({
      message: 'exception.user.EXISTS',
      code: HttpStatus.BAD_REQUEST,
      params: { email },
    });
  }
}
