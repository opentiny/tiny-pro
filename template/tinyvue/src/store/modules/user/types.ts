export type RoleType = '' | '*' | 'admin' | 'user'
export interface Role {
  id: string
  name: string
  permission: {
    name: string
    desc: string
    id: string
  }[]
  menus: { id: string, name: string }[]
}
export interface UserInfo {
  id: string
  name: string
  email: string
  department?: string
  employeeType?: string
  job?: string
  probationStart?: string
  probationEnd?: string
  probationDuration?: string
  protocolStart?: string
  protocolEnd?: string
  address?: string
  status?: string
  role: Role[]
  updateTime?: any
  createTime?: any
  roleId?: number
  rolePermission?: string[]
}
export interface UserFilterData {
  sort?: number
  startTime?: string
  endTime?: string
  filterStatus?: Array<string>
  filterType?: Array<string>
  submit?: boolean
  reset?: boolean
}
export type UserState = UserInfo & UserFilterData & { refreshToken: string, accessToken: string }
