const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'token:refresh'

const storage = localStorage

/** 兼容旧版 sessionStorage，避免已登录用户需重新登录 */
function migrateFromSessionStorage() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const refresh = sessionStorage.getItem(REFRESH_TOKEN_KEY)
  if (token && !storage.getItem(TOKEN_KEY)) {
    storage.setItem(TOKEN_KEY, token)
  }
  if (refresh && !storage.getItem(REFRESH_TOKEN_KEY)) {
    storage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
  if (token) {
    sessionStorage.removeItem(TOKEN_KEY)
  }
  if (refresh) {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

function isLogin() {
  migrateFromSessionStorage()
  return !!storage.getItem(TOKEN_KEY)
}

function getToken() {
  migrateFromSessionStorage()
  return storage.getItem(TOKEN_KEY)
}

function getRefreshToken() {
  migrateFromSessionStorage()
  return storage.getItem(REFRESH_TOKEN_KEY)
}

function setRefreshToken(token: string) {
  storage.setItem(REFRESH_TOKEN_KEY, token)
}

function setToken(token: string) {
  storage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export { clearToken, getRefreshToken, getToken, isLogin, setRefreshToken, setToken }
