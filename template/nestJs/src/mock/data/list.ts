import type { EmployeeRecord } from './employee-query';
import { successResponseWrap } from '../utils';
import {
  createEmployeeList,
  queryEmployeePage,
  updateEmployeeRecord,
} from './employee-query';

const tableData: EmployeeRecord[] = createEmployeeList(60);

export default [
  {
    url: '/api/employee/getEmployee',
    method: 'post',
    response: (params: { body: any }) => {
      return successResponseWrap(queryEmployeePage(tableData, params.body || {}));
    },
  },
  {
    url: '/api/employee/getEmployeeInfo',
    method: 'post',
    response: (params) => {
      const { id } = params.body || {};
      return tableData.find((item) => item.id === id) || {};
    },
  },
  {
    url: '/api/employee/updateEmployeeInfo',
    method: 'post',
    response: (params) => {
      const { data } = params.body || {};
      return updateEmployeeRecord(tableData, data || {});
    },
  },
  {
    url: '/api/employee/delete',
    method: 'delete',
    response: (params: { query: any }) => {
      const { id } = params.query || {};
      const idx = tableData.findIndex((item) => item.id === id);
      if (idx !== -1) {
        tableData.splice(idx, 1);
      }
      return successResponseWrap(true);
    },
  },
] as const;
