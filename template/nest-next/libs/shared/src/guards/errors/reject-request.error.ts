import { DomainError } from "@app/shared/error.base";
import { HttpStatus } from "@nestjs/common";

export class RejectRequest extends DomainError {
  constructor(){
    super({
      code: HttpStatus.BAD_REQUEST,
      message: 'exception.common.REJECT_REQUEST'
    })
  }
}