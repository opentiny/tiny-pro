import axios from 'axios';

export interface QueryTaskParmas {
  pageIndex: number;
  pageSize: number;
  [key: string]: any;
}

export function getServicesList(params: QueryTaskParmas) {
  return axios.get(`${import.meta.env.VITE_BASE_API}/application`, {
    params,
  });
}
