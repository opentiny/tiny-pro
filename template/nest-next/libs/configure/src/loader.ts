import { readFileSync } from 'fs';
import { join } from 'path';

export const loader = () =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  JSON.parse(readFileSync(join(__dirname, './config/config.json')).toString());
