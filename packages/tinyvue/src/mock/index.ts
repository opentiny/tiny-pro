import { createMockServer } from '@gaonengwww/mock-server';
import list from './list';
import froms from '../views/form/step/mock';
import profile from './profile';
import board from './board';
import user from './user';

let mockData = [...list, ...froms, ...profile, ...board, ...user] as any;

createMockServer({
  mocks: mockData,
});
