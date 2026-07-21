import axios from 'axios'

export interface QueryTaskParams {
  page: number
  limit: number
  [key: string]: any
}

export function getServicesList(params: QueryTaskParams) {
  return axios.get(`/application`, {
    params,
  })
}
