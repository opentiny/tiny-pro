import { createI18n, I18n } from 'vue-i18n';
import locale from '@opentiny/vue-locale'; // tiny-vue的国际化
import en from './en-US';
import cn from './zh-CN';

export const LOCALE_OPTIONS = [
  { label: '中文', value: 'zhCN' },
  { label: 'English', value: 'enUS' },
];

// eslint-disable-next-line no-underscore-dangle, import/no-mutable-exports
export let _i18:
  | I18n<any, any, any, any, true>
  | I18n<any, any, any, any, false>
  | null = null;

const i18nmode = (option: any) => {
  option.legacy = false;
  _i18 = createI18n({
    ...option,
    missingWarn: false,
  });
  return _i18;
};

export default (i18n: any) =>
  locale.initI18n({
    globalInjection: true,
    i18n,
    createI18n: i18nmode,
    messages: {
      enUS: en,
      zhCN: cn,
    },
  });
