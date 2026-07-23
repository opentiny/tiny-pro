import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DomainError } from './error.base';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';
import { I18nTranslations } from './.generate/i18n.generated';

@Catch(Error)
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter<Error> {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly i18n: I18nService<I18nTranslations>) {}
  catch(exception: any, host: ArgumentsHost) {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();
    const lang =
      request.headers['accept-language']?.replace('-', '').split(',')[0] ||
      'enUS';
    if (exception instanceof DomainError) {
      const { code, message, details, args } = exception;
      const translatedMessage = this.i18n.translate(message, { args, lang });
      return response.status(code).json({
        statusCode: code,
        message: translatedMessage,
        details,
      });
    }
    if (exception instanceof HttpException && exception.getStatus() !== 500) {
      const msg = exception.message;
      return response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: msg,
      });
    }
    return response.status(500).json({
      statusCode: 500,
      message: this.i18n.translate('exception.common.INTERNAL_ERROR', { lang }),
    });
  }
}
