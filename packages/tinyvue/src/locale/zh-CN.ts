import localeLogin from '@/views/login/locale/zh-CN';
import localeHttpError from './zh-CN/httpError';

export default {
  ...localeLogin,
  ...localeHttpError,
  'router.not-exists-valid-route': '路由出现异常,请联系管理员',
};
