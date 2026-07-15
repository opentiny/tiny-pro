import { DomainError } from '@app/shared';
import { HttpStatus } from '@nestjs/common';

export class MenuExists extends DomainError {
  constructor(name: string) {
    super({
      code: HttpStatus.BAD_REQUEST,
      message: 'exception.menu.EXISTS',
      params: { name },
    });
  }
}
