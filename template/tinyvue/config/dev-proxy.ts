export interface DevProxyEnv {
  VITE_BASE_API: string
  VITE_MOCK_SERVER_HOST: string
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
    [env.VITE_MOCK_SERVER_HOST]: {
      target: apiTarget,
      changeOrigin: true,
      rewrite: (path: string) =>
        path.replace(
          new RegExp(`^${env.VITE_MOCK_SERVER_HOST}`),
          useMock ? '' : env.VITE_MOCK_SERVER_HOST,
        ),
    },
  }
}
