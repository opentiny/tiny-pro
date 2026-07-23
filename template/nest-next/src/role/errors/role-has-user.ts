import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class RoleHasUserError extends DomainError {
  constructor() {
    super({
      message: 'exception.role.NOT_EMPTY',
      code: HttpStatus.BAD_REQUEST,
    });
  }
}
