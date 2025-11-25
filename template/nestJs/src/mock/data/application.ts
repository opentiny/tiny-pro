import { mock } from 'mockjs';
import { successResponseWrap } from '../utils';
const taskList = mock({
  'list|60': [
    {
      id: '@id',
      name: 'Tiny Design ',
      description:
        'HUA WEI CLOUD PRODUCT AND SERVICES DESIGN ,INCLUDES EXCHANGE DESIGN ,WORDS,INCLUDES EXCHANGE DESIGN ,WORDS',
      'tag|1-3': [
        {
          'type|1': ['success', '', 'info', 'danger', 'warning'],
          'value|1': ['dev', 'design', 'test', 'online'],
        },
      ],
      'icon|1': ['logo-top2.png', 'info1.png', 'info2.png'],
    },
  ],
});

let treeData = [];
const tableData = taskList.list;

export default [
  // list
  {
    url: '/api/application',
    method: 'get',
    response: (params: { body: any }) => {
      console.log(params);
      const { pageIndex = 1, pageSize = 10 } = JSON.parse(
        JSON.stringify(params.body || {})
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
] as const;
