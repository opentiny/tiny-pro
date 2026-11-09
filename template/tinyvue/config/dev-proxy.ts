export interface DevProxyEnv {
  VITE_BASE_API: string
  VITE_SERVER_HOST: string
  VITE_MOCK_HOST: string
}

export interface DevProxyRewrite {
  target: string
  changeOrigin: true
  logLevel?: 'debug'
  rewrite: (path: string) => string
}

export function createDevProxyConfig(
  env: DevProxyEnv,
  useMock: boolean,
): Record<string, DevProxyRewrite> {
  const apiTarget = useMock ? env.VITE_MOCK_HOST : env.VITE_SERVER_HOST

  return {
    // 富文本栏目文档数据是纯演示数据，始终由 tinyvue 的 mock 服务提供（不走 nestJs/springboot）。
    // 请求不带 /mock 前缀（/api/editor/...）：代理按对象键定义顺序首个匹配，
    // 本条目须定义在 /api 之前，命中后原样（保留 /api 前缀）转发到 mock 服务，
    // 其 handler 注册在 /api/editor 下；其余 /api 请求仍按模式转发
    [`${env.VITE_BASE_API}/editor`]: {
      target: env.VITE_MOCK_HOST,
      changeOrigin: true,
      rewrite: (path: string) => path,
    },
    [env.VITE_BASE_API]: {
      target: apiTarget,
      changeOrigin: true,
      logLevel: 'debug',
      rewrite: (path: string) =>
        path.replace(
          new RegExp(`^${env.VITE_BASE_API}`),
          useMock ? env.VITE_BASE_API : '',
        ),
    },
  }
}
