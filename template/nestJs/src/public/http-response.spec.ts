import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Logger,
} from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { HttpResponseExceptionFilter } from './http-response.exception-filter';
import { HttpResponseInterceptor } from './http-response.interceptor';

function httpContext(path: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl: path }),
    }),
  } as ExecutionContext;
}

function respond(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe('HttpResponseInterceptor', () => {
  const interceptor = new HttpResponseInterceptor();

  it('adds code 200 to object responses without changing their fields', async () => {
    const result = await firstValueFrom(
      interceptor.intercept(httpContext('/user/info'), respond({ id: 1 }))
    );
    expect(result).toEqual({ id: 1, code: 200 });
  });

  it('wraps arrays and primitives with a success envelope', async () => {
    const arrayResult = await firstValueFrom(
      interceptor.intercept(httpContext('/menu'), respond([{ id: 1 }]))
    );
    const primitiveResult = await firstValueFrom(
      interceptor.intercept(httpContext('/editor/document/update'), respond(true))
    );
    expect(arrayResult).toEqual({
      data: [{ id: 1 }],
      errMsg: '',
      code: 200,
    });
    expect(primitiveResult).toEqual({ data: true, errMsg: '', code: 200 });
  });

  it('keeps health checks and robot streams unchanged', async () => {
    expect(
      await firstValueFrom(
        interceptor.intercept(httpContext('/healthCheck'), respond('success'))
      )
    ).toBe('success');
    expect(
      await firstValueFrom(
        interceptor.intercept(
          httpContext('/robot/chat/completions'),
          respond('stream')
        )
      )
    ).toBe('stream');
  });
});

describe('HttpResponseExceptionFilter', () => {
  function createHost() {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as any;
    return { response, host };
  }

  it('uses the HTTP status as code and preserves existing error fields', () => {
    const { response, host } = createHost();
    new HttpResponseExceptionFilter().catch(
      new HttpException({ message: 'Bad request', errors: ['Invalid field'] }, 400),
      host
    );
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: null,
        errMsg: 'Bad request',
        code: 400,
        message: 'Bad request',
        errors: ['Invalid field'],
        statusCode: 400,
      })
    );
  });

  it('maps unexpected errors to code 500', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { response, host } = createHost();
    new HttpResponseExceptionFilter().catch(new Error('Database failed'), host);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: null,
        errMsg: 'Database failed',
        code: 500,
        statusCode: 500,
      })
    );
  });
});
