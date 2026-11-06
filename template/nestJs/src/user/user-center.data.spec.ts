import { queryUserCenterData } from './user-center.data';

describe('queryUserCenterData', () => {
  it('keeps the original order unless the sort asks for reverse', () => {
    const forward = queryUserCenterData({ sort: 1 });
    const reverse = queryUserCenterData({ sort: 2 });

    expect(forward.tableData[0].id).toBe('1');
    expect(reverse.tableData[0].id).toBe('10');
    expect(forward.tableData).toHaveLength(10);
  });

  it('filters table rows by type, status and time without mutating later queries', () => {
    const filtered = queryUserCenterData({
      filterType: ['A'],
      filterStatus: ['C'],
      startTime: '2020-01-01',
      endTime: '2021-01-01',
    });
    const next = queryUserCenterData();

    const week = filtered.chartData[0];
    expect(filtered.tableData.map(item => item.id)).toEqual(['6']);
    expect('list' in week && week.list.every(item => item.bid === 'A' && item.pid === 'C')).toBe(true);
    expect(next.tableData).toHaveLength(10);
  });
});
