import { Path, PathValue } from 'nestjs-i18n';
import { TokenPayload as ITokenPayload } from '../entity';
import { createParamDecorator } from '@nestjs/common';
import get from 'lodash.get';

export type Fields<Payload extends ITokenPayload> = Path<Payload>;

export const TokenPayload = createParamDecorator(
  (data: Fields<ITokenPayload>, ctx) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as ITokenPayload;
    return get(user, data) as PathValue<ITokenPayload, typeof data>;
  },
);
