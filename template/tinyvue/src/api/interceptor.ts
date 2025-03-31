import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Modal } from '@opentiny/vue';
import locale from '@opentiny/vue-locale';
import router from '@/router';
import { getToken, clearToken } from '@/utils/auth';

export interface HttpResponse<T = unknown> {
  errMsg: string;
  code: string | number;
  data: T;
}

const { VITE_API_BASE_URL, VITE_BASE_API, VITE_MOCK_IGNORE } = import.meta
  .env || { VITE_BASE_API: '', VITE_MOCK_IGNORE: '' };

if (VITE_API_BASE_URL) {
  axios.defaults.baseURL = VITE_API_BASE_URL;
}

const ignoreMockApiList = VITE_MOCK_IGNORE?.split(',') || [];
axios.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    const isProxy = ignoreMockApiList.includes(config.url);
    if (isProxy) {
      config.url = config.url?.replace(VITE_BASE_API, '/api/v1');
    }

    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers = { ...config.headers };
    config.headers['x-lang'] = localStorage.getItem('tiny-locale') ?? 'zhCN';

    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  },
);
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response;
    if (res.request.responseURL.includes('mock')) {
      return res.data;
    }
    return res;
  },
  (error) => {
    const { status, data } = error.response;
    if (status === 403 && error.config.method.toLowerCase() === 'get') {
      Modal.message({
        message: data.message,
        status: 'error',
      });
    }
    if (status === 401) {
      Modal.message({
        message: locale.t('http.error.TokenExpire'),
        status: 'error',
      });
      clearToken();
      router.replace({ name: 'login' });
    }
    if (status === 400) {
      data.message = error.response.data.errors?.[0] ?? data.message;
    }

    return Promise.reject(error);
  },
);
