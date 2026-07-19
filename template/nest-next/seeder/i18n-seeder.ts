import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { readFileSync } from 'fs';
import { join } from 'path';
import { I18n, Lang } from '../src/i18';
import { log } from './utils/log';

export class I18nRecordSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const I18_INIT_FILE_PATH = join(process.cwd(), 'locales.json');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const I18_INIT_FILE: Record<string, Record<string, string>> = JSON.parse(
      readFileSync(I18_INIT_FILE_PATH).toString(),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const langs = Object.keys(I18_INIT_FILE);
    for (const name of langs) {
      const dbLang = await em.findOne(Lang, { name });
      if (dbLang) {
        log.info(`${name} already exists`);
        continue;
      }
      const lang = em.create(Lang, { name });
      em.persist(lang);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      for (const [key, content] of Object.entries(I18_INIT_FILE[name])) {
        const record = em.create(I18n, {
          key,
          content,
          lang,
        });
        em.persist(record);
      }
    }
    await em.flush();
    log.success('i18n seeder success');
  }
}
