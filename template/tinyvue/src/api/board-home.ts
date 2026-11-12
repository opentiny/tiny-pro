import axios from 'axios'
import { boardHomeData } from '../mock/board-home'

export function getBoardHome() {
  return axios.get(`${import.meta.env.VITE_BASE_API}/board/home`)
    .catch(() => ({ data: boardHomeData }))
}
