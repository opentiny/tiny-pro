import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Modal } from '@opentiny/vue'
import locale from '@opentiny/vue-locale'
import axios from 'axios'
import router from '@/router'
import { clearToken, getToken } from '@/utils/auth'

export interface HttpResponse<T = unknown> {
  errMsg: string
  code: string | number
  data: T
}

interface MockRequestConfig extends AxiosRequestConfig {
  isMockApi?: boolean
}

const MOCK_API_PREFIX = '/mock/api'

const { VITE_API_BASE_URL, VITE_BASE_API, VITE_MOCK_IGNORE } = import.meta
  .env || { VITE_BASE_API: '', VITE_MOCK_IGNORE: '' }

if (VITE_API_BASE_URL) {
  axios.defaults.baseURL = VITE_API_BASE_URL
}

const ignoreMockApiList = VITE_MOCK_IGNORE?.split(',') || []
axios.interceptors.request.use(
  (config: MockRequestConfig): any => {
    const isProxy = ignoreMockApiList.includes(config.url)
    if (isProxy) {
      config.url = config.url?.replace(VITE_BASE_API, '/api/v1')
    }

    // 统一将 /mock/api 前缀改写为 /api 发出，mock 路由由后端或 dev proxy 按 /api 提供；
    // 同时打上标记，供响应拦截器识别 mock 响应，不再依赖 URL 中的 /mock
    if (config.url?.includes(MOCK_API_PREFIX)) {
      config.url = config.url.replace(MOCK_API_PREFIX, '/api')
      config.isMockApi = true
    }

    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers = { ...config.headers }
    config.headers['x-lang'] = localStorage.getItem('tiny-locale') ?? 'zhCN'

    return config
  },
  (error) => {
    // do something
    return Promise.reject(error)
  },
)
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response
    const requestConfig = res.config as MockRequestConfig | undefined
    if (requestConfig?.isMockApi || res.request.responseURL.includes('mock')) {
      return res.data
    }
    return res
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(error)
    }
    const { status, data } = error.response
    if (status === 403 && error.config.method.toLowerCase() === 'get') {
      Modal.message({
        message: data.message,
        status: 'error',
      })
    }
    if (status === 401) {
      Modal.message({
        message: locale.t('http.error.TokenExpire'),
        status: 'error',
      })
      clearToken()
      router.replace({ name: 'login' })
    }
    if (status === 400) {
      data.message = error.response.data.errors?.[0] ?? data.message
    }

    return Promise.reject(error)
  },
)
