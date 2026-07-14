import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class RoleExistsError extends DomainError {
  constructor(name: string) {
    super({
      code: HttpStatus.BAD_REQUEST,
      message: `exception.role.EXISTS`,
      params: { name },
    });
  }
}
