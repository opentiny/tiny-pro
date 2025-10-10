import axios from 'axios';
import { Lang } from './lang';

export type I18Table = {
  [lang: string]: {
    [key: string]: string;
  };
};
export interface Locals {
  items: Local[];
  meta: Meta;
}
export interface Local {
  content: string;
  id: number;
  key: string;
  lang: Lang;
}
export interface Meta {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
export interface CreateLocal {
  content: string;
  key: string;
  lang: number;
}
export interface CreateLocalReturn {
  content: string;
  id: number;
  key: string;
  lang: Lang;
}

type DeleteLocaleRet = Omit<CreateLocalReturn, 'id'>;

export const getLocalTable = (lang?: string) => {
  return axios.get<I18Table>(`${import.meta.env.VITE_BASE_API}/i18/format`, { params: { lang } });
};

export const getAllLocalItems = (
  page?: number,
  limit?: number,
  all?: number,
  filters?: {
    [x: string]: number[] | string;
  },
) => {
  return axios.get<Locals>(`${import.meta.env.VITE_BASE_API}/i18`, {
    params: { page, limit, all, ...filters },
  });
};

export const createLocalItem = (data: CreateLocal) => {
  return axios.post<CreateLocalReturn>(`${import.meta.env.VITE_BASE_API}/i18`, data);
};
export const deleteLocale = (id: number) => {
  return axios.delete<DeleteLocaleRet>(`${import.meta.env.VITE_BASE_API}/i18/${id}`);
};

export const patchLocal = (id: number, data: Partial<CreateLocal>) => {
  return axios.patch(`${import.meta.env.VITE_BASE_API}/i18/${id}`, data);
};

export const batchDeleteLocal = (ids: string[]) => {
  return axios.post(`${import.meta.env.VITE_BASE_API}/i18/batch`, ids)
}