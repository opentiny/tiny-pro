/// <reference types="vite/client" />

export {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_MOCK_SERVER_HOST: string
    readonly VITE_LOWCODE_DESIGNER_ENABLED: string
    readonly VITE_LOWCODE_DESIGNER_URL: string
    readonly VITE_CONTEXT: string
    readonly VITE_BASE_API: string
    readonly VITE_SERVER_HOST: string
    readonly VITE_MOCK_HOST: string
    readonly VITE_USE_MOCK: string
    readonly VITE_MOCK_IGNORE: string
  }
  declare const BUILD_TOOLS: string
  declare interface NodeRequire {
    context: any
  }
}

declare module '@opentiny/vue-locale';
declare module '@opentiny/vue';
declare module '@opentiny/vue-icon';
declare module '@opentiny/vue-theme/theme-tool.js';
declare module '@opentiny/vue-theme/theme';
declare module 'query-string';
