import axios from 'axios';

export type Lang = {
  id: number;
  name: string;
};
export interface CreateLangDTO {
  name: string;
}

export const getAllLang = () => {
  return axios.get<Lang[]>('/api/lang');
};
export const createLang = (data: CreateLangDTO) => {
  return axios.post<Lang>('/api/lang', data);
};

export const patchLang = (data: Partial<CreateLangDTO>, id: number) => {
  return axios.patch<Lang>(`/api/lang/${id}`, data);
};

export const deleteLang = (id: number) => {
  return axios.delete<{ name: string }>(`/api/lang/${id}`);
};
