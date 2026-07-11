import { DomainError } from "@app/shared";
import { HttpStatus } from "@nestjs/common";

export class MenuNotFound extends DomainError {
  constructor(){
    super({
      code: HttpStatus.NOT_FOUND,
      message: 'exception.menu.NOT_FOUND'
    })
  }
}