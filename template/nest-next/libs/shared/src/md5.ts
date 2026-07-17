import { createHash } from 'crypto';

export function md5(param: any[]): string {
  const hasher = createHash('md5');
  param.forEach((val) => hasher.update(JSON.stringify(val)));
  return hasher.digest('hex');
}
