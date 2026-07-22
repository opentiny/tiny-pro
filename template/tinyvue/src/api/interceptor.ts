import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Modal } from '@opentiny/vue'
import locale from '@opentiny/vue-locale'
import axios from 'axios'
import router from '@/router'
import { clearToken, getRefreshToken, getToken, setRefreshToken, setToken } from '@/utils/auth'
import { flushToken } from './user'

export interface HttpResponse<T = unknown> {
  errMsg: string
  code: string | number
  data: T
}

const { VITE_BASE_API, VITE_MOCK_IGNORE } = import.meta
  .env || { VITE_BASE_API: '', VITE_MOCK_IGNORE: '' }

if (VITE_BASE_API) {
  axios.defaults.baseURL = VITE_BASE_API
}

const ignoreMockApiList = VITE_MOCK_IGNORE?.split(',') || []
axios.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    const isProxy = ignoreMockApiList.includes(config.url)
    if (isProxy) {
      config.url = config.url?.replace(VITE_BASE_API, '/api/v1')
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
    if (res.request.responseURL.includes('mock')) {
      return res.data
    }
    return res
  },
  (error) => {
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
      if (!getRefreshToken()) {
        clearToken()
        router.replace({ name: 'login' })
        return
      }
      return flushToken({
        token: getRefreshToken(),
      })
        .then((data) => {
          setToken(data.data.accessToken)
          setRefreshToken(data.data.refreshToken)
          router.go(0)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }
    if (status === 400) {
      data.message = error.response.data.errors?.[0] ?? data.message
    }

    return Promise.reject(error)
  },
)
