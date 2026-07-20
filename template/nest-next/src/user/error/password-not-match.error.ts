import { DomainError } from "@app/shared";
import { HttpStatus } from "@nestjs/common";

export class PasswordNotMatchError extends DomainError {
  constructor() {
    super({
      message: 'exception.user.PASSWORD_NOT_MATCH',
      code: HttpStatus.BAD_REQUEST,
    })
  }
}
