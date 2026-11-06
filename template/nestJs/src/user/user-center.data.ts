export interface UserCenterQuery {
  sort?: number
  startTime?: string
  endTime?: string
  filterStatus?: string[]
  filterType?: string[]
}

interface CenterRow {
  id: string
  bid: string
  pid: string
  name: string
  time: string
  type: string
  status: string
}

interface ChartItem {
  type: string
  status: string
  len: number
  bid: string
  pid: string
}

const tableSeed: CenterRow[] = [
  { id: '1', bid: 'A', pid: 'D', name: 'GFD Company', time: '2021-12-18', type: 'userInfo.type.optionA', status: 'userInfo.status.optionD' },
  { id: '2', bid: 'B', pid: 'A', name: 'WWWW Company', time: '2021-11-18', type: 'userInfo.type.optionB', status: 'userInfo.status.optionA' },
  { id: '3', bid: 'C', pid: 'B', name: 'TGBYX Company', time: '2021-10-18', type: 'userInfo.type.optionC', status: 'userInfo.status.optionB' },
  { id: '4', bid: 'B', pid: 'D', name: 'GF Company', time: '2021-09-18', type: 'userInfo.type.optionB', status: 'userInfo.status.optionC' },
  { id: '5', bid: 'C', pid: 'C', name: 'Property management company', time: '2021-07-18', type: 'userInfo.type.optionA', status: 'userInfo.status.optionD' },
  { id: '6', bid: 'A', pid: 'C', name: 'Property management company', time: '2020-12-23', type: 'userInfo.type.optionA', status: 'userInfo.status.optionC' },
  { id: '7', bid: 'B', pid: 'C', name: 'GF Company', time: '2020-11-08', type: 'userInfo.type.optionB', status: 'userInfo.status.optionC' },
  { id: '8', bid: 'B', pid: 'C', name: 'WWWW Company', time: '2020-10-18', type: 'userInfo.type.optionB', status: 'userInfo.status.optionC' },
  { id: '9', bid: 'C', pid: 'D', name: 'WWWW Company', time: '2020-10-11', type: 'userInfo.type.optionC', status: 'userInfo.status.optionD' },
  { id: '10', bid: 'C', pid: 'D', name: 'TGBYX Company', time: '2020-06-18', type: 'userInfo.type.optionC', status: 'userInfo.status.optionD' },
]

const chartSeed: ChartItem[] = [
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionA', len: 1, bid: 'A', pid: 'A' },
  { type: 'userInfo.type.optionC', status: 'userInfo.status.optionB', len: 5, bid: 'C', pid: 'B' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionC', len: 3, bid: 'A', pid: 'C' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionA', len: 1, bid: 'A', pid: 'A' },
  { type: 'userInfo.type.optionB', status: 'userInfo.status.optionA', len: 6, bid: 'B', pid: 'A' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionC', len: 1, bid: 'A', pid: 'C' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionA', len: 1, bid: 'A', pid: 'A' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionB', len: 1, bid: 'A', pid: 'B' },
  { type: 'userInfo.type.optionB', status: 'userInfo.status.optionA', len: 1, bid: 'B', pid: 'A' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionC', len: 1, bid: 'A', pid: 'C' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionD', len: 1, bid: 'A', pid: 'D' },
  { type: 'userInfo.type.optionC', status: 'userInfo.status.optionD', len: 1, bid: 'C', pid: 'D' },
  { type: 'userInfo.type.optionA', status: 'userInfo.status.optionD', len: 1, bid: 'A', pid: 'D' },
]

function matchesCode(selected: string[] | undefined, value: string) {
  return !selected?.length || selected.includes(value)
}

function matchesTime(time: string, startTime?: string, endTime?: string) {
  const itemTime = new Date(time).getTime()
  if (startTime && itemTime - new Date(startTime).getTime() <= 0) {
    return false
  }
  if (endTime && itemTime - new Date(endTime).getTime() >= 0) {
    return false
  }
  return true
}

export function queryUserCenterData(query: UserCenterQuery = {}) {
  const table = tableSeed.map(item => ({ ...item }))
  const chartList = chartSeed.map(item => ({ ...item }))
  if (query.sort === 2 || query.sort === 4) {
    table.reverse()
    chartList.reverse()
  }
  const tableData = table.filter(item =>
    matchesCode(query.filterType, item.bid)
    && matchesCode(query.filterStatus, item.pid)
    && matchesTime(item.time, query.startTime, query.endTime),
  )
  const list = chartList.filter(item =>
    matchesCode(query.filterType, item.bid)
    && matchesCode(query.filterStatus, item.pid),
  )
  return {
    chartData: [
      { title: 'userInfo.week.1', value: 1, list },
      ...Array.from({ length: 17 }, (_, index) => ({
        title: `userInfo.month.${index + 1}`,
        value: 0,
      })),
    ],
    tableData,
  }
}
