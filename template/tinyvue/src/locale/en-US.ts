import localeLogin from '@/views/login/locale/en-US';
import localeHttpError from './en-US/httpError';

export default {
  ...localeLogin,
  ...localeHttpError,
  'router.not-exists-valid-route':
    'Route encountered an exception, please contact the administrator',
};
