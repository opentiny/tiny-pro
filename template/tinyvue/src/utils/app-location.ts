import type { LocationQueryRaw, RouteLocationRaw } from 'vue-router'

const BLOCKED_REDIRECT_NAMES = ['login', 'notFound', 'redirect', 'preview', 'root']

function withContext(path: string, context = import.meta.env?.VITE_CONTEXT || '/') {
  const base = context.endsWith('/') ? context : `${context}/`
  return `${base}${path.replace(/^\//, '')}`
}

export function defaultSignedInPath(context?: string) {
  return withContext('board/home', context)
}

export function unauthorizedLoginLocation(to: {
  fullPath: string
  query: LocationQueryRaw
}) {
  return {
    name: 'login' as const,
    query: {
      ...to.query,
      redirect: to.fullPath,
    } as LocationQueryRaw,
  }
}

export function resolvePostLoginLocation(
  redirect: unknown,
  {
    fallbackPath = defaultSignedInPath(),
    loginPath = withContext('login'),
  }: {
    fallbackPath?: string
    loginPath?: string
  } = {},
): RouteLocationRaw {
  if (typeof redirect !== 'string' || !redirect) {
    return { path: fallbackPath }
  }
  const pathOnly = redirect.split('?')[0]
  if (pathOnly === loginPath || pathOnly === `${loginPath}/`) {
    return { path: fallbackPath }
  }
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    const url = new URL(redirect, 'http://local.invalid')
    return {
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      hash: url.hash,
    }
  }
  if (BLOCKED_REDIRECT_NAMES.includes(redirect) || redirect.startsWith('//')) {
    return { path: fallbackPath }
  }
  return { name: redirect }
}
