import axios from 'axios';

export type Permission = {
  desc: string;
  id: number;
  name: string;
};

export function getAllPermission(page?: number, limit?: number, name?: string) {
  return axios.get(`/api/permission`, {
    params: { page, limit, name },
  });
}

export function updatePermission(data: any) {
  return axios.patch(`/api/permission`, data);
}

export function deletePermission(id: number) {
  return axios.delete(`/api/permission/${id}`);
}

export function createPermission(data: any) {
  return axios.post(`/api/permission`, data);
}
