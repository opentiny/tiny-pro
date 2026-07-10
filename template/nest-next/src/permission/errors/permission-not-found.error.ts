import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class PermissionNotFound extends DomainError {
  constructor() {
    super({
      code: HttpStatus.NOT_FOUND,
      message: 'exception.permission.NOT_FOUND',
    });
  }
}
