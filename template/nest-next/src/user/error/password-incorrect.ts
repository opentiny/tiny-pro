import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class PasswordIncorrect extends DomainError {
  constructor() {
    super({
      code: HttpStatus.BAD_REQUEST,
      message: 'exception.user.PASSWORD_INCORRECT',
    });
  }
}
