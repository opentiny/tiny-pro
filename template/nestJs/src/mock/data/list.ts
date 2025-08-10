import { mock } from 'mockjs';
import { successResponseWrap } from '../utils';
const taskList = mock({
  'list|60': [
    {
      id: '@id',
      name: '@cname',
      rank: '初级',
      description: '一段描述文字',
      createTime: '@datetime',
      'status|1': ['0', '1', '2'],
      type: 'Tiny Design',
      roles: '前端',
      employeeNo: '@integer(10000000, 99999999)',
      department: '公共服务',
      departmentLevel: '二级',
      workbenchName: 'work',
      project: 'TinyDesign',
      address: '西安研究所',
      lastUpdateUser: '张三',
    },
  ],
});

let treeData = [];
const tableData = taskList.list;

export default [
  // list
  {
    url: '/api/employee/getEmployee',
    method: 'post',
    response: (params: { body: any }) => {
      const { pageIndex = 1, pageSize = 10 } = JSON.parse(
        JSON.stringify(params.body)
      );
      const index = pageIndex as number;
      const size = pageSize as number;
      const offset = (index - 1) * size;
      const count = index * size;
      treeData = tableData.slice(offset, count);
      const data = mock({
        total: 60,
        data: treeData,
      });

      return successResponseWrap(data);
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
      let res = false;
      tableData.find((item, index) => {
        if (item.id === data.id) {
          res = true;
          Object.keys(data).forEach((key) => {
            if (key !== 'id') {
              item[key] = data[key];
            }
          });
          return true;
        }
      });

      return res;
    },
  },
] as const;
