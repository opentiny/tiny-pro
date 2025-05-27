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
  return axios.post<LoginRes>('/api/auth/login', data);
}
export function loginMail(data: LoginDataMail) {
  return axios.post<LoginRes>('/api/mail/login', data);
}

export function logout(data: LogoutData) {
  return axios.post<LoginRes>('/api/auth/logout', data);
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
  return axios.get<UserInfo>(`/api/user?${params.toString()}`);
}

// 获取单个用户
export function getUserInfo(email?: string) {
  return axios.get<UserInfo>(`/api/user/info/${email ?? ''}`);
}

export function deleteUser(email: string) {
  return axios.delete<UserInfo>(`/api/user/${email}`);
}

export function updateUserInfo(data: any) {
  return axios.patch('/api/user/update', data);
}

export function getUserData(data?: UserData) {
  return axios.post<UserRes>(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/user/data`,
    data,
  );
}

export function registerUser(data: any) {
  return axios.post<UserInfo>('/api/user/reg', data);
}

export function updatePwdAdmin(data: any) {
  return axios.patch('/api/user/admin/updatePwd', data);
}

export function updatePwdUser(data: any) {
  return axios.patch('/api/user/updatePwd', data);
}

export const batchDeleteUsers = (emails: string[]) => {
  return axios.post('/api/user/batch', emails)
}
