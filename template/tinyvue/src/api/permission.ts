import axios from 'axios'

export interface Permission {
  desc: string
  id: number
  name: string
}

export function getAllPermission(page?: number, limit?: number, name?: string) {
  return axios.get(`/permission`, {
    params: { page, limit, name },
  })
}

export function updatePermission(data: any) {
  return axios.patch(`/permission`, data)
}

export function deletePermission(id: number) {
  return axios.delete(`/permission/${id}`)
}

export function createPermission(data: any) {
  return axios.post(`/permission`, data)
}
