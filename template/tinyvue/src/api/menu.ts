import axios from 'axios'

export interface ITreeNodeData {
  // node-key='id' 设置节点的唯一标识
  id: number | string
  // 节点显示文本
  label: string
  // 子节点
  children?: ITreeNodeData[]
  // 链接
  url: string
  // 组件
  component: string
  // 图标
  customIcon: string
  // 类型
  menuType: string
  // 父节点
  parentId: number
  // 排序
  order: number
  // 国际化
  locale: string
}

export interface CreateMenuDto {
  order: number
  menuType: string
  name: string
  path: string
  component: string
  icon: string
  locale: string
  parentId: number | null
}

export function getAllMenu() {
  return axios.get<ITreeNodeData[]>(`/menu`)
}

export function getRoleMenu(email: string) {
  return axios.get(`/menu/role/${email}`)
}

export function updateMenu(data: any) {
  return axios.patch(`/menu`, data)
}

export function deleteMenu(id: number, parentId: number) {
  return axios.delete(`/menu?id=${id}&parentId=${parentId}`)
}

export function createMenu(data: any) {
  return axios.post(`/menu`, data)
}
