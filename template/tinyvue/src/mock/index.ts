import { createMockServer } from '@gaonengwww/mock-server'
import froms from '../views/form/step/mock'
import board from './board'
import list from './list'
import profile from './profile'
import user from './user'

const mockData = [...list, ...froms, ...profile, ...board, ...user] as any

createMockServer({
  mocks: mockData,
})
