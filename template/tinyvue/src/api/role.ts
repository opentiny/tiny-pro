import { IPaginationMeta } from '@/types/global';
import axios from 'axios';

export type Role = {
  id: number;
  name: string;
  permission: {
    name: string;
    desc: string;
    id: number;
  }[];
};
export type GetAllRoleDetailRet = {
  roleInfo: {
    meta: IPaginationMeta;
    items: Role[];
  };
  menuTree: any[];
};

export function getAllRole() {
  return axios.get('/api/role');
}

export function getAllRoleDetail(page = 1, limit = 10, name?: string) {
  return axios.get<GetAllRoleDetailRet>('/api/role/detail', {
    params: { page, limit, name },
  });
}

export function updateRole(data: any) {
  return axios.patch(`/api/role`, data);
}

export function deleteRole(id: number) {
  return axios.delete(`/api/role/${id}`);
}

export function createRole(data: any) {
  return axios.post(`/api/role`, data);
}

export function getRoleInfo(id: number) {
  return axios.get(`/api/role/info/${id}`);
}
