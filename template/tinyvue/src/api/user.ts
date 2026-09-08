import type { UserInfo } from '@/store/modules/user/types'
import type { FilterType } from '@/types/global'
import axios from 'axios'

export interface LoginData {
  email: string
  password: string
}

export interface LogoutData {
  token: string | null
}

export interface RegisterData {
  username: string
  email: string
  password: string
  roleIds: number[]
}

export interface LoginDataMail {
  mailname: string
  mailpassword: string
}
export interface LoginResponse {
  accessToken: string
  accessTokenTTL: number
  refreshToken: string
  refreshTokenTTL: number
}

export interface LoginRes {
  token: string
  userInfo: UserInfo
}
export interface UserRes {
  chartData: []
  tableData: []
}
export interface UserData {
  sort?: number | undefined
  startTime?: string
  endTime?: string
  filterStatus?: []
  filterType?: []
}
export interface RefreshToken {
  token: string
}

export function flushToken(data: RefreshToken) {
  return axios.post<LoginResponse>(`/auth/token/refresh`, data)
}
export function login(data: LoginData) {
  return axios.post<LoginResponse>(`/auth/login`, data)
}
export function loginMail(data: LoginDataMail) {
  return axios.post<LoginRes>(`/mail/login`, data)
}

export function logout(data: LogoutData) {
  return axios.post<LoginRes>(`/auth/logout`, data)
}

// 获取全部用户
export function getAllUser(page?: number, limit?: number, filter?: FilterType) {
  const keys = Object.keys(filter ?? {})
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('limit', limit.toString())
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = filter[key]
    if (value === undefined) {
      continue
    }
    if (value.type === 'enum') {
      if (Array.isArray(value.value) && value.value.length) {
        params.set(key, value.value.toString())
      }
    }
    if (value.type === 'input' && !Array.isArray(value.value)) {
      const sql = `${value.value.relation === 'contains' ? '%' : ''}${value.value.text}${value.value.relation === 'startwith' || value.value.relation === 'contains' ? '%' : ''}`
      params.set(key, sql)
    }
  }
  return axios.get<UserInfo>(`/user?${params.toString()}`)
}

// 获取单个用户
export function getUserInfo(email?: string) {
  return axios.get<UserInfo>(`/user/info/${email ?? ''}`)
}

export function deleteUser(email: string) {
  return axios.delete<UserInfo>(`/user/${email}`)
}

export function updateUserInfo(data: any) {
  return axios.patch(`/user/update`, data)
}

export function getUserData(data?: UserData) {
  return axios.post<UserRes>(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/user/data`,
    data,
  )
}

export function registerUser(data: any) {
  return axios.post<UserInfo>(`/user/reg`, data)
}

export function updatePwdAdmin(data: any) {
  return axios.patch(`/user/admin/updatePwd`, data)
}

export function updatePwdUser(data: any) {
  return axios.patch(`/user/updatePwd`, data)
}

export function batchDeleteUsers(emails: string[]) {
  return axios.post(`/user/batch`, emails)
}
