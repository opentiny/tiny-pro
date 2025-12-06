const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'token:refresh';

const isLogin = () => {
  return !!sessionStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};
const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY);

const setRefreshToken = (token: string) => {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

const setToken = (token: string) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export { isLogin, getToken, setToken, clearToken, getRefreshToken, setRefreshToken};
