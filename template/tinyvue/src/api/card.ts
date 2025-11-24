import axios from 'axios';

export interface QueryTaskParmas {
  pageIndex: number;
  pageSize: number;
  [key: string]: any;
}

export function getServicesList(params: QueryTaskParmas) {
  return axios.post(
    `${import.meta.env.VITE_MOCK_SERVER_HOST}/api/service-application`,
    params,
  );
}
