import { HttpStatus } from '@nestjs/common';
import { I18nPath } from './.generate/i18n.generated';

export type DomainErrorProps = {
  message: I18nPath;
  code: HttpStatus;
  details?: unknown;
  params?: Record<string, any>;
  cause?: Error;
};

export class DomainError extends Error {
  /**
   * HTTP 状态码
   * @type {HttpStatus}
   */
  public readonly code: HttpStatus;
  /**
   * 错误信息
   * @type {I18nPath}
   */
  public readonly message: I18nPath;
  /**
   * 附加详情
   * @type {unknown}
   */
  public readonly details?: unknown;
  /**
   * 模板参数，用于格式化错误信息
   * @type {Record<string, any>}
   */
  public readonly args?: Record<string, any>;

  constructor(props: DomainErrorProps) {
    super(props.message, { cause: props.cause });
    this.code = props.code;
    this.message = props.message;
    this.details = props.details;
    this.args = props.params;
  }
}
