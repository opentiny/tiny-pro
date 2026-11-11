import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import data from './data';

/**
 * mock 数据联调模式（pnpm start:mock，MOCK_MODE=true）。
 *
 * 前端经 dev proxy 剥掉 /api 前缀后，接口以 /user/getdata 等形式到达，
 * 这里补回 /api 前缀与 mock 数据注册表匹配，命中则直接响应内存 mock 数据，
 * 未命中放行给后续真实业务路由。支持 :param 与 :param? 路径参数。
 */
function matchUrl(
  pattern: string,
  pathname: string
): Record<string, string> | null {
  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);
  let minSegments = patternSegments.length;
  while (
    minSegments > 0 &&
    patternSegments[minSegments - 1].endsWith('?')
  ) {
    minSegments -= 1;
  }
  if (
    pathSegments.length < minSegments ||
    pathSegments.length > patternSegments.length
  ) {
    return null;
  }
  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    const segment = patternSegments[i];
    if (segment.startsWith(':')) {
      const name = segment.slice(1).replace(/\?$/, '');
      if (i < pathSegments.length) {
        params[name] = decodeURIComponent(pathSegments[i]);
      }
    } else if (segment !== pathSegments[i]) {
      return null;
    }
  }
  return params;
}

@Injectable()
export class MockModeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 注意：全局前缀会导致 NestJS 改写 req.url，匹配时必须用 req.originalUrl
    const [originalPath] = (req.originalUrl || req.url).split('?');
    const path = `/api${originalPath}`;
    const method = req.method.toLowerCase();
    for (const item of data) {
      if (item.method !== method) {
        continue;
      }
      const params = matchUrl(item.url, path);
      if (!params) {
        continue;
      }
      Promise.resolve(
        item.response({
          body: req.body ?? null,
          query: req.query,
          params,
        })
      )
        .then((result) => res.json(result))
        .catch(next);
      return;
    }
    next();
  }
}
