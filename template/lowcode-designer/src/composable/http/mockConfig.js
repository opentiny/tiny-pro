/**
 * Mock 路由配置
 * 用于纯前端项目的接口 mock
 */

// Mock 用户数据（真实接口返回格式）
const mockUserData = {
  data: {
    id: 1,
    username: '开发者',
    email: 'developer@lowcode.com',
    provider: null,
    password: null,
    confirmationToken: 'uuid~dfafasdfasdfa',
    confirmed: true,
    blocked: false,
    created_by: null,
    updated_by: null,
    created_at: '2021-11-11T13:52:21.000Z',
    updated_at: '2022-11-01T01:39:30.000Z',
    block: false,
    is_admin: true,
    is_public: false,
  },
  locale: 'zh-cn',
};

// 格式化响应数据
const getResponseData = (data) => {
  return {
    data,
    error: null,
  };
};

export default [
  // 获取用户信息
  {
    url: /\/api\/user\/me$|\/user\/me$/, // 使用正则表达式匹配
    method: 'GET',
    response: async () => {
      return [200, getResponseData(mockUserData)];
    },
  },
];
