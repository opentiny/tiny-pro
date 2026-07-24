import { defineService, META_SERVICE } from '@opentiny/tiny-engine';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

let http = null;
let mock = null;

const createInterceptorHandler =
  (http) =>
  ({ data, type }) => {
    if (typeof data === 'function') {
      http.interceptors[type].use(data);

      return;
    }

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (!item) return;

        if (Array.isArray(item)) {
          http.interceptors[type].use(...item);

          return;
        }

        if (typeof item === 'function') {
          http.interceptors[type].use(item);
        }
      });
    }
  };

export default defineService({
  id: META_SERVICE.Http,
  type: 'MetaService',
  options: {
    axiosConfig: {
      // axios 配置
      baseURL: '',
      withCredentials: false, // 跨域请求时是否需要使用凭证
      headers: {}, // 请求头
    },
    interceptors: {
      // 拦截器
      request: [], // 支持配置多个请求拦截器，先注册后执行
      response: [], // 支持配置多个响应拦截器，先注册先执行
    },
    mockConfig: [],
  },
  init: ({ options = {} }) => {
    const { axiosConfig = {}, interceptors = {}, enableMock } = options;
    const { request = [], response = [] } = interceptors;

    http = axios.create(axiosConfig);
    if (enableMock) {
      mock = new AxiosMockAdapter(http);
      mock.onGet(/\/mock\/bundle\.json$/).passThrough();
      mock.onPost(/\/app-center\/api\/ai\/chat/).passThrough();
      // 允许 tiny-pro 的接口通过，不被 mock 拦截
      mock.onAny(/\/api\/auth\/api-token/).passThrough();
      mock.onAny(/\/api\/i18n/).passThrough();
      mock.onAny(/\/api\/menu/).passThrough();
      mock.onAny(/\/api\/role/).passThrough();
      mock.onAny(/\/api\/role\/detail/).passThrough();

      http.interceptors.request.use((config) => {
        const AI_PATH = '/app-center/api/ai/chat';

        if (config.url === AI_PATH) {
          config.url = `/tiny-engine${AI_PATH}`; // 修改路径
        }
        return config;
      });

      mock.onAny().reply(async (config) => {
        const { mockConfig = [] } = options;
        // 构建完整 URL（包含 baseURL）
        const fullUrl = (config.baseURL || '') + (config.url || '');
        const method = (config.method || 'GET').toUpperCase();

        const mockItem = mockConfig.find((item) => {
          // 方法匹配
          if (item.method && method !== item.method.toUpperCase()) {
            return false;
          }

          // URL 匹配 - 同时检查 config.url 和 fullUrl
          if (typeof item.url === 'string') {
            return (
              item.url === config.url ||
              item.url === fullUrl ||
              config.url?.includes(item.url) ||
              fullUrl.includes(item.url)
            );
          }

          if (item.url instanceof RegExp) {
            return item.url.test(config.url) || item.url.test(fullUrl);
          }

          return false;
        });

        if (mockItem) {
          if (typeof mockItem.response === 'function') {
            return mockItem.response(config);
          }
          return mockItem.response;
        }

        // 如果没有匹配到，输出调试信息
        console.warn(
          `[Mock] 未匹配到接口: ${method} ${fullUrl || config.url}`,
          '可用路由:',
          mockConfig.map((item) => `${item.method || 'ANY'} ${item.url}`)
        );

        return [
          200,
          {
            code: 200,
            errMsg:
              '当前 demo 暂未支持该接口，请前往GitHub 或者 Gitee 克隆项目完整体验',
            error:
              '当前 demo 暂未支持该接口，请前往GitHub 或者 Gitee 克隆项目完整体验',
          },
        ];
      });
    }

    const addInterceptors = createInterceptorHandler(http);
    addInterceptors({ data: request, type: 'request' });
    addInterceptors({ data: response, type: 'response' });
  },
  apis: () => ({
    getHttp: () => http,
    getMock: () => mock,
    get: (...args) => http?.get(...args),
    post: (...args) => http?.post(...args),
    request: (...args) => http?.request(...args),
    put: (...args) => http?.put(...args),
    delete: (...args) => http?.delete(...args),
    setOptions: (options) => {
      // 支持动态设置选项
      if (options.axiosConfig) {
        Object.assign(http.defaults, options.axiosConfig);
      }
      if (options.interceptors) {
        const addInterceptors = createInterceptorHandler(http);
        if (options.interceptors.request) {
          addInterceptors({
            data: options.interceptors.request,
            type: 'request',
          });
        }
        if (options.interceptors.response) {
          addInterceptors({
            data: options.interceptors.response,
            type: 'response',
          });
        }
      }
      // 重新初始化 mock（如果启用）
      if (options.enableMock && options.mockConfig) {
        // 如果 mock 已存在，先恢复
        if (mock) {
          mock.restore();
        }
        mock = new AxiosMockAdapter(http);
        mock.onGet(/\/mock\/bundle\.json$/).passThrough();
        mock.onPost(/\/app-center\/api\/ai\/chat/).passThrough();
        // 允许 /api/auth/api-token 接口通过，不被 mock 拦截
        mock.onAny(/\/api\/auth\/api-token/).passThrough();

        http.interceptors.request.use((config) => {
          const AI_PATH = '/app-center/api/ai/chat';

          if (config.url === AI_PATH) {
            config.url = `/tiny-engine${AI_PATH}`;
          }
          return config;
        });

        mock.onAny().reply(async (config) => {
          // 构建完整 URL（包含 baseURL）
          const fullUrl = (config.baseURL || '') + (config.url || '');
          const method = (config.method || 'GET').toUpperCase();

          const mockItem = options.mockConfig.find((item) => {
            // 方法匹配
            if (item.method && method !== item.method.toUpperCase()) {
              return false;
            }

            // URL 匹配 - 同时检查 config.url 和 fullUrl
            if (typeof item.url === 'string') {
              return (
                item.url === config.url ||
                item.url === fullUrl ||
                config.url?.includes(item.url) ||
                fullUrl.includes(item.url)
              );
            }

            if (item.url instanceof RegExp) {
              return item.url.test(config.url) || item.url.test(fullUrl);
            }

            return false;
          });

          if (mockItem) {
            if (typeof mockItem.response === 'function') {
              return mockItem.response(config);
            }
            return mockItem.response;
          }

          // 如果没有匹配到，输出调试信息
          console.warn(
            `[Mock] 未匹配到接口: ${method} ${fullUrl || config.url}`,
            '可用路由:',
            options.mockConfig.map(
              (item) => `${item.method || 'ANY'} ${item.url}`
            )
          );

          return [
            200,
            {
              code: 200,
              errMsg:
                '当前 demo 暂未支持该接口，请前往GitHub 或者 Gitee 克隆项目完整体验',
              error:
                '当前 demo 暂未支持该接口，请前往GitHub 或者 Gitee 克隆项目完整体验',
            },
          ];
        });
      }
    },
  }),
});
