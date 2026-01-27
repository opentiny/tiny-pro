import axios from 'axios'

export interface QueryTaskParmas {
  pageIndex: number
  pageSize: number
  [key: string]: any
}

export interface BaseEmployeeInfo {
  name: string
  status: string
  type: string
  roles: string
  employeeNo: string
  department: string
  departmentLevel: string
  workbenchName: string
  project: string
  address: string
  createTime: string
  lastUpdateUser: string
}

export interface EmployeeInfo extends BaseEmployeeInfo {
  id: string
  rank: string
  description: string
}

export interface UpdateEmployeeInfo extends BaseEmployeeInfo {
  id: string
}

export function queryEmployeeList(params: QueryTaskParmas) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/getEmployee`,
    params,
  )
}
export function deleteEmployee(id: string) {
  return axios.delete(`${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/delete?id=${id}`)
}

// 新增获取员工信息的方法
export function getEmployeeInfo(id: string) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/getEmployeeInfo`,
    { id },
  )
}

export function updateEmployeeInfo(data: any) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/employee/updateEmployeeInfo`,
    { data },
  )
}
