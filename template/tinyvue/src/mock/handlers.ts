import type { MockMethod } from './dispatch'
import froms from '../views/form/step/mock'
import application from './application'
import { createBackendMocks } from './backend'
import board from './board'
import list from './list'
import profile from './profile'
import user from './user'

export function createMockHandlers(): MockMethod[] {
  return [
    ...createBackendMocks(),
    ...list,
    ...froms,
    ...profile,
    ...board,
    ...user,
    ...application,
  ]
}
