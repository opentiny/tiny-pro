const TOKEN_KEY = 'token';

const isLogin = () => {
  return !!sessionStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export { isLogin, getToken, setToken, clearToken };
