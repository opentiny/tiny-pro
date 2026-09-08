import froms from '../views/form/step/mock'
import application from './application'
import { createBackendMocks } from './backend'
import board from './board'
import list from './list'
import profile from './profile'
import { startMockServer } from './server'
import user from './user'

const mockData = [
  ...createBackendMocks(),
  ...list,
  ...froms,
  ...profile,
  ...board,
  ...user,
  ...application,
] as any

startMockServer(mockData)
