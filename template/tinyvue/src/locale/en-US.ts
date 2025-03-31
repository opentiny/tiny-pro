import localeLogin from '@/views/login/locale/en-US';
import localeI18 from '@/views/locale/locale/en-US';
import localeHttpError from './en-US/httpError';

export default {
  ...localeLogin,
  ...localeI18,
  ...localeHttpError,
  'router.not-exists-valid-route':
    'Route encountered an exception, please contact the administrator',
};
