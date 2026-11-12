import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpResponseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpResponseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body =
      exceptionResponse !== null &&
      typeof exceptionResponse === 'object' &&
      !Array.isArray(exceptionResponse)
        ? (exceptionResponse as Record<string, unknown>)
        : {};
    const rawMessage =
      body.message ??
      (typeof exceptionResponse === 'string' ? exceptionResponse : undefined) ??
      (exception instanceof Error ? exception.message : 'Internal server error');
    const errMsg = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : String(rawMessage);
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(errMsg, exception instanceof Error ? exception.stack : '');
    }
    response.status(status).json({
      ...body,
      data: body.data ?? null,
      errMsg,
      code: status,
      message: body.message ?? errMsg,
      statusCode: status,
    });
  }
}
