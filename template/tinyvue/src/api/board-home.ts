import axios from 'axios'

export function getBoardHome() {
  return axios.get(`${import.meta.env.VITE_BASE_API}/board/home`)
}
