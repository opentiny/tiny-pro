const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'token:refresh'

function isLogin() {
  return !!sessionStorage.getItem(TOKEN_KEY)
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}
const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY)

function setRefreshToken(token: string) {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
}

function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export { clearToken, getRefreshToken, getToken, isLogin, setRefreshToken, setToken }
