import axios from 'axios';
import { UserInfo } from '@/store/modules/user/types';
import { FilterType } from '@/types/global';

export interface LoginData {
  email: string;
  password: string;
}

export interface LogoutData {
  token: string | null;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  roleIds: number[];
}

export interface LoginDataMail {
  mailname: string;
  mailpassword: string;
}

export interface LoginRes {
  token: string;
  userInfo: UserInfo;
}
export interface UserRes {
  chartData: [];
  tableData: [];
}
export interface UserData {
  sort?: number | undefined;
  startTime?: string;
  endTime?: string;
  filterStatus?: [];
  filterType?: [];
}

export function login(data: LoginData) {
  return axios.post<LoginRes>(`${import.meta.env.VITE_BASE_API}/auth/login`, data);
}
export function loginMail(data: LoginDataMail) {
  return axios.post<LoginRes>(`${import.meta.env.VITE_BASE_API}/mail/login`, data);
}

export function logout(data: LogoutData) {
  return axios.post<LoginRes>(`${import.meta.env.VITE_BASE_API}/auth/logout`, data);
}

// 获取全部用户
export function getAllUser(page?: number, limit?: number, filter?: FilterType) {
  const keys = Object.keys(filter ?? {});
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = filter[key];
    if (value === undefined) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (value.type === 'enum') {
      if (Array.isArray(value.value) && value.value.length) {
        params.set(key, value.value.toString());
      }
    }
    if (value.type === 'input' && !Array.isArray(value.value)) {
      let sql = `${value.value.relation === 'contains' ? '%' : ''}${value.value.text}${value.value.relation === 'startwith' || value.value.relation === 'contains' ? '%' : ''}`;
      params.set(key, sql);
    }
  }
  return axios.get<UserInfo>(`${import.meta.env.VITE_BASE_API}/user?${params.toString()}`);
}

// 获取单个用户
export function getUserInfo(email?: string) {
  return axios.get<UserInfo>(`${import.meta.env.VITE_BASE_API}/user/info/${email ?? ''}`);
}

export function deleteUser(email: string) {
  return axios.delete<UserInfo>(`${import.meta.env.VITE_BASE_API}/user/${email}`);
}

export function updateUserInfo(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/user/update`, data);
}

export function getUserData(data?: UserData) {
  return axios.post<UserRes>(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}${import.meta.env.VITE_BASE_API}/user/data`,
    data,
  );
}

export function registerUser(data: any) {
  return axios.post<UserInfo>(`${import.meta.env.VITE_BASE_API}/user/reg`, data);
}

export function updatePwdAdmin(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/user/admin/updatePwd`, data);
}

export function updatePwdUser(data: any) {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/user/updatePwd`, data);
}

export const batchDeleteUsers = (emails: string[]) => {
  return axios.post(`${import.meta.env.VITE_BASE_API}/user/batch`, emails)
}
