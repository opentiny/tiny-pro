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

let refreshPromise: Promise<string> | null = null

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
    return Promise.reject(error)
  },
)

let retry = false

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
      if (retry) {
        retry = false
        clearToken()
        setTimeout(() => {
          router.replace({ name: 'login' })
        }, 0)
        Modal.message({
          message: locale.t('http.error.TokenExpire'),
          status: 'error',
        })
        return Promise.reject(error)
      }

      retry = true
      if (!getRefreshToken()) {
        clearToken()
        setTimeout(() => {
          router.replace({ name: 'login' })
        }, 0)
        Modal.message({
          message: locale.t('http.error.TokenExpire'),
          status: 'error',
        })
        return Promise.reject(error)
      }

      if (!refreshPromise) {
        refreshPromise = flushToken({ token: getRefreshToken() })
          .then((res) => {
            const newAccessToken = res.data.accessToken
            const newRefreshToken = res.data.refreshToken
            setToken(newAccessToken)
            setRefreshToken(newRefreshToken)
            return newAccessToken
          })
          .catch((err) => {
            clearToken()
            router.replace({ name: 'login' })
            Modal.message({
              message: locale.t('http.error.TokenExpire'),
              status: 'error',
            })
            return Promise.reject(err)
          })
          .finally(() => {
            refreshPromise = null
          })
      }
      return refreshPromise
        .then((newToken) => {
          if (!error.config.headers) {
            error.config.headers = {}
          }
          error.config.headers.Authorization = `Bearer ${newToken}`
          return axios.request(error.config)
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
