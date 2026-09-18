import type { BackendState } from './backend-data'
import type { MockMethod } from './dispatch'
import { createBackendState } from './backend-data'

export const MOCK_BACKEND_STORAGE_KEY = 'tiny-pro-mock-backend-state'
export const MOCK_BACKEND_STATE_VERSION = 1

export interface BackendStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function createMemoryStorage(): BackendStorage {
  const data = new Map<string, string>()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

export function createDefaultBackendStorage(): BackendStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  }
  catch {
    // Accessing localStorage can throw in some private browsing modes.
  }
  return createMemoryStorage()
}

function toEntries(value: unknown): [string, string][] {
  return Array.isArray(value) ? value : []
}

export function serializeBackendState(state: BackendState) {
  return {
    version: MOCK_BACKEND_STATE_VERSION,
    credentials: [...state.credentials.entries()],
    languages: state.languages,
    localeTable: state.localeTable,
    localeRecords: state.localeRecords,
    menuTree: state.menuTree,
    permissions: state.permissions,
    roles: state.roles,
    refreshTokens: [...state.refreshTokens.entries()],
    tokens: [...state.tokens.entries()],
    users: state.users,
  }
}

export function deserializeBackendState(raw: unknown): BackendState | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const data = raw as Record<string, unknown>
  if (data.version !== MOCK_BACKEND_STATE_VERSION) {
    return null
  }
  if (!Array.isArray(data.credentials) || !Array.isArray(data.users)) {
    return null
  }
  return {
    credentials: new Map(toEntries(data.credentials)),
    languages: data.languages as BackendState['languages'],
    localeTable: data.localeTable as BackendState['localeTable'],
    localeRecords: data.localeRecords as BackendState['localeRecords'],
    menuTree: data.menuTree as BackendState['menuTree'],
    permissions: data.permissions as BackendState['permissions'],
    roles: data.roles as BackendState['roles'],
    refreshTokens: new Map(toEntries(data.refreshTokens)),
    tokens: new Map(toEntries(data.tokens)),
    users: data.users as BackendState['users'],
  }
}

export function loadBackendState(storage: BackendStorage): BackendState {
  try {
    const raw = storage.getItem(MOCK_BACKEND_STORAGE_KEY)
    if (!raw) {
      return createBackendState()
    }
    return deserializeBackendState(JSON.parse(raw)) ?? createBackendState()
  }
  catch {
    return createBackendState()
  }
}

export function saveBackendState(storage: BackendStorage, state: BackendState) {
  try {
    storage.setItem(
      MOCK_BACKEND_STORAGE_KEY,
      JSON.stringify(serializeBackendState(state)),
    )
  }
  catch {
    // Ignore quota and private-mode write failures.
  }
}

export function withBackendPersist(
  mocks: MockMethod[],
  storage: BackendStorage,
  state: BackendState,
): MockMethod[] {
  const persist = () => saveBackendState(storage, state)
  return mocks.map(mock => ({
    ...mock,
    response: (context) => {
      const result = mock.response(context)
      if (result && typeof result === 'object' && 'then' in result) {
        return Promise.resolve(result).finally(persist)
      }
      persist()
      return result
    },
  }))
}
