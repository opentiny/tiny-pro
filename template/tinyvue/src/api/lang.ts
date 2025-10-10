import axios from 'axios';

export type Lang = {
  id: number;
  name: string;
};
export interface CreateLangDTO {
  name: string;
}

export const getAllLang = () => {
  return axios.get<Lang[]>(`${import.meta.env.VITE_BASE_API}/lang`);
};
export const createLang = (data: CreateLangDTO) => {
  return axios.post<Lang>(`${import.meta.env.VITE_BASE_API}/lang`, data);
};

export const patchLang = (data: Partial<CreateLangDTO>, id: number) => {
  return axios.patch<Lang>(`${import.meta.env.VITE_BASE_API}/lang/${id}`, data);
};

export const deleteLang = (id: number) => {
  return axios.delete<{ name: string }>(`${import.meta.env.VITE_BASE_API}/lang/${id}`);
};
