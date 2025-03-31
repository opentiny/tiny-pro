export const successResponseWrapper = (data: unknown) => {
  return {
    data,
    status: 'ok',
    msg: '请求成功',
    code: 20000,
  };
};

export const failResponseWrapper = (
  data: unknown,
  msg: string,
  code = 50000
) => {
  return {
    data,
    status: 'fail',
    msg,
    code,
  };
};

export const successResponseWrap = (data: unknown) => {
  return {
    data,
    errMsg: '',
    code: '0',
  };
};

export const failResponseWrap = (
  data: unknown,
  errMsg: string,
  code = '500'
) => {
  return {
    data,
    errMsg,
    code,
  };
};
