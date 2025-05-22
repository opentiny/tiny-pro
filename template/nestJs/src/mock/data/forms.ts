import { mock } from 'mockjs';
import { successResponseWrap } from '../utils';

const initBase = mock({
  position: [
    {
      value: '1',
      label: 'position1',
    },
    {
      value: '2',
      label: 'position2',
    },
    {
      value: '3',
      label: 'position3',
    },
    {
      value: '4',
      label: 'position4',
    },
  ],
  HR: [
    {
      value: '1',
      label: 'test01',
    },
    {
      value: '2',
      label: 'test01',
    },
    {
      value: '3',
      label: 'test03',
    },
  ],
  mentor: ['Teacher1', 'Teacher2', 'Teacher3', 'Teacher4'],
  director: ['Director1', 'Director2', 'Director3', 'Director4'],
});

export default [
  // init-base
  {
    url: '/api/base/getdata',
    method: 'get',
    response: () => {
      return successResponseWrap(initBase);
    },
  },

  // init-step
  {
    url: '/api/step/getdata',
    method: 'get',
    response: () => {
      return successResponseWrap(initBase);
    },
  },

  // submit
  {
    url: '/api/channel-form/submit',
    method: 'post',
    response: () => {
      return successResponseWrap('ok');
    },
  },
] as any;
