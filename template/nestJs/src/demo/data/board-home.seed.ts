export const boardHomeSeed = {
  cards: {
    week: [
      { value: '4.18', trend: 'up', change: '6.7%', type: 'success', percent: 83 },
      { value: '1.92', trend: 'down', change: '1.6%', type: 'danger', percent: 57 },
      { value: '3.44', trend: 'up', change: '1.25%', type: 'success', percent: 74 },
      { value: '0.81', trend: 'down', change: '0.9%', type: 'danger', percent: 43 },
    ],
    day: [
      { value: '3.76', trend: 'up', change: '4.1%', type: 'success', percent: 79 },
      { value: '1.68', trend: 'up', change: '1.3%', type: 'success', percent: 61 },
      { value: '3.08', trend: 'down', change: '1.1%', type: 'danger', percent: 65 },
      { value: '0.66', trend: 'up', change: '2.8%', type: 'success', percent: 49 },
    ],
    hour: [
      { value: '2.95', trend: 'down', change: '0.4%', type: 'danger', percent: 69 },
      { value: '1.21', trend: 'down', change: '0.8%', type: 'danger', percent: 52 },
      { value: '3.37', trend: 'up', change: '1.9%', type: 'success', percent: 86 },
      { value: '0.58', trend: 'up', change: '3.5%', type: 'success', percent: 55 },
    ],
  },
  curve: {
    pv: [12, 14, 15, 18, 21, 24, 23, 20, 19, 22, 26, 29, 31, 30, 27, 25, 23, 24, 26, 28, 30, 29, 25, 22],
    play: [18, 17, 19, 21, 23, 25, 27, 26, 24, 23, 25, 28, 30, 32, 31, 29, 27, 26, 28, 29, 31, 30, 28, 26],
    page: [24, 26, 28, 27, 25, 24, 26, 29, 31, 33, 35, 34, 32, 30, 29, 31, 33, 34, 32, 30, 28, 27, 29, 30],
  },
  falls: {
    pv: [11, 16, 20, 24, 15, 28],
    play: [15, 25, 13, 21, 29, 18],
    page: [23, 18, 30, 26, 21, 32],
  },
  round: {
    ring: [
      { value: 426, name: '5G' },
      { value: 913, name: '4G' },
      { value: 268, name: 'home.round.unknow' },
      { value: 347, name: '3G' },
    ],
    stations: [
      { key: 'home.round.station1', percentage: 78, color: '#5cb87a' },
      { key: 'home.round.station2', percentage: 63, color: '#1989fa' },
      { key: 'home.round.station3', percentage: 91, color: '#e6a23c' },
      { key: 'home.round.station4', percentage: 46, color: '#f56c6c' },
    ],
  },
  region: [
    { name: '北京市', value: 286400 },
    { name: '天津市', value: 86500 },
    { name: '上海市', value: 325800 },
    { name: '重庆市', value: 105600 },
    { name: '河北省', value: 46300 },
    { name: '河南省', value: 52700 },
    { name: '辽宁省', value: 31800 },
    { name: '山东省', value: 71820 },
    { name: '江苏省', value: 96850 },
    { name: '浙江省', value: 88420 },
    { name: '湖北省', value: 57430 },
    { name: '广东省', value: 132680 },
    { name: '四川省', value: 69320 },
    { name: '陕西省', value: 43870 },
  ],
  regionTable: [
    { id: 'DB-1', space: '深圳', pv: '2136(42.18%)', play: '0.38s', page: '1.9s' },
    { id: 'DB-2', space: '杭州', pv: '1482(29.25%)', play: '0.41s', page: '2.1s' },
    { id: 'DB-3', space: '北京', pv: '716(14.14%)', play: '0.47s', page: '2.4s' },
    { id: 'DB-4', space: '成都', pv: '421(8.31%)', play: '0.52s', page: '2.8s' },
    { id: 'DB-5', space: '南京', pv: '310(6.12%)', play: '0.49s', page: '2.5s' },
  ],
};
