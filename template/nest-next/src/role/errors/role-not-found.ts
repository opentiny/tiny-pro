import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class RoleNotFound extends DomainError {
  constructor() {
    super({
      message: 'exception.role.NOT_FOUND',
      code: HttpStatus.NOT_FOUND,
    });
  }
}
