import { successResponseWrap, successResponseWrapper } from '../utils';
import { initData } from './setup';

const positive = JSON.parse(JSON.stringify(initData.tableData));
const negative = JSON.parse(JSON.stringify(initData.tableData.reverse()));
const initlist = JSON.parse(JSON.stringify(initData.chartData[0].list));
const userInfo = JSON.parse(JSON.stringify(initData.userInfo));

export default [
  {
    url: '/api/user/data',
    method: 'post',
    response: (params: any) => {
      const { sort, startTime, endTime, filterStatus, filterType } = JSON.parse(
        JSON.stringify(params.body)
      );
      initData.tableData = positive;
      initData.chartData[0].list = initlist;
      if (sort === 1 || sort === 3) {
        initData.chartData[0].list.reverse();
        initData.tableData = positive;
        return successResponseWrap(initData);
      }
      if (sort === 2 || sort === 4) {
        initData.chartData[0].list.reverse();
        initData.tableData = negative;
        return successResponseWrap(initData);
      }
      if (
        startTime !== '' ||
        endTime !== '' ||
        filterStatus.length !== 0 ||
        (filterType.length !== 0 && sort === undefined)
      ) {
        const start = new Date(JSON.parse(JSON.stringify(startTime))).getTime();
        const end = new Date(JSON.parse(JSON.stringify(endTime))).getTime();
        // eslint-disable-next-line func-names
        const table = initData.tableData.filter(function (item: any) {
          return (
            filterType.includes(item.bid) &&
            filterStatus.includes(item.pid) &&
            new Date(JSON.parse(JSON.stringify(item.time))).getTime() - start >
              0 &&
            new Date(JSON.parse(JSON.stringify(item.time))).getTime() - end < 0
          );
        });
        // eslint-disable-next-line func-names
        const chart = initData.chartData[0].list.filter(function (item: any) {
          return (
            filterType.includes(item.bid) && filterStatus.includes(item.pid)
          );
        });
        initData.tableData = table;
        initData.chartData[0].list = chart;
        return successResponseWrap(initData);
      }
      return successResponseWrap(initData);
    },
  },
] as const;
