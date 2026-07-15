import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class UserNotFound extends DomainError {
  constructor() {
    super({
      message: 'excpetion.user.NOT_FOUND',
      code: HttpStatus.NOT_FOUND,
    });
  }
}
