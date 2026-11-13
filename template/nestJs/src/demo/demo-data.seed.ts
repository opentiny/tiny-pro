import { boardHomeSeed } from './data/board-home.seed';

export const demoDataSeed = {
  'board-home': boardHomeSeed,
  'work-data': {
    options: [
      { value: '3', label: 'work.mock.Test' },
      { value: '1', label: 'work.mock.employees' },
      { value: '2', label: 'work.mock.onboard' },
    ],
  },
  'work-practice': {
    options: [
      { value: '2', label: 'work.mock.week2' },
      { value: '3', label: 'work.mock.week3' },
      { value: '1', label: 'work.mock.week1' },
    ],
  },
  'work-train': {
    options: [
      {
        value: 'work.mock.collectValue2',
        description: 'work.mock.collectDescription2',
        label1: 'work.mock.collectHotLabel1',
        label2: 'work.mock.collectLabel3',
      },
      {
        value: 'work.mock.collectValue4',
        description: 'work.mock.collectDescription4',
        label1: 'work.mock.collectHotLabel1',
        label2: 'work.mock.collectLabel5',
        isNews: true,
      },
      {
        value: 'work.mock.collectValue1',
        description: 'work.mock.collectDescription1',
        label1: 'work.mock.collectHotLabel1',
        label2: 'work.mock.collectLabel2',
      },
      {
        value: 'work.mock.collectValue3',
        description: 'work.mock.collectDescription3',
        label1: 'work.mock.collectHotLabel1',
        label2: 'work.mock.collectLabel4',
      },
    ],
  },
  'work-select': {
    options1: [136, 248, 391, 520],
    options2: [418, 675, 892, 1280],
    options3: [9860, 420, 1268, 305],
  },
  'form-options': {
    position: [
      { value: '1', label: '云平台工程师' },
      { value: '2', label: '前端开发工程师' },
      { value: '3', label: '体验设计师' },
      { value: '4', label: '质量工程师' },
    ],
    HR: [
      { value: '1', label: '许文静' },
      { value: '2', label: '唐晓岚' },
      { value: '3', label: '韩志远' },
    ],
    mentor: ['周明轩', '林佳怡', '黄志强', '苏婉清'],
    director: ['秦立国', '沈丹青', '陆子谦', '顾清远'],
    status: ['running', 'finished', 'delayed'],
    department: [
      { value: '1', label: '云平台部' },
      { value: '2', label: '前端技术部' },
      { value: '3', label: '质量保障部' },
    ],
  },
  'profile-detail': {
    Project: [
      'baseForm.form.label.projectthree',
      'baseForm.form.label.projectone',
      'baseForm.form.label.projecttwo',
    ],
    tableData: [
      { id: 'REL-DB-001', version: 'v3.6.0', operation: 'online', updated: '周明轩', time: '2026-10-28' },
      { id: 'REL-DB-002', version: 'v3.5.2', operation: 'offline', updated: '黄志强', time: '2026-10-21' },
      { id: 'REL-DB-003', version: 'v3.5.1', operation: 'online', updated: '林佳怡', time: '2026-10-15' },
      { id: 'REL-DB-004', version: 'v3.5.0', operation: 'online', updated: '苏婉清', time: '2026-10-09' },
      { id: 'REL-DB-005', version: 'v3.4.0', operation: 'offline', updated: '何宇辰', time: '2026-09-26' },
    ],
  },
  'user-center': {
    tableData: [
      { id: 'TASK-DB-001', bid: 'A', pid: 'B', name: '完成云平台数据库联调', time: '2026-11-02 09:30:00', type: 'userInfo.type.optionA', status: 'userInfo.status.optionB' },
      { id: 'TASK-DB-002', bid: 'B', pid: 'A', name: '验收监控页性能指标', time: '2026-11-04 11:20:00', type: 'userInfo.type.optionB', status: 'userInfo.status.optionA' },
      { id: 'TASK-DB-003', bid: 'C', pid: 'C', name: '补充质量网关自动化用例', time: '2026-11-06 14:10:00', type: 'userInfo.type.optionC', status: 'userInfo.status.optionC' },
      { id: 'TASK-DB-004', bid: 'A', pid: 'D', name: '整理企业工作台发布记录', time: '2026-11-08 16:40:00', type: 'userInfo.type.optionA', status: 'userInfo.status.optionD' },
      { id: 'TASK-DB-005', bid: 'B', pid: 'B', name: '评审设计资产中心交互稿', time: '2026-11-10 10:25:00', type: 'userInfo.type.optionB', status: 'userInfo.status.optionB' },
      { id: 'TASK-DB-006', bid: 'C', pid: 'A', name: '完成项目列表持久化验证', time: '2026-11-12 17:15:00', type: 'userInfo.type.optionC', status: 'userInfo.status.optionA' },
    ],
    chartData: [
      {
        title: 'userInfo.tab.two',
        value: 1,
        list: [
          { sort: 1, bid: 'A', type: 'userInfo.type.optionA', status: 'userInfo.status.optionB', len: 3, pid: 'B' },
          { sort: 2, bid: 'B', type: 'userInfo.type.optionB', status: 'userInfo.status.optionA', len: 5, pid: 'A' },
          { sort: 3, bid: 'C', type: 'userInfo.type.optionC', status: 'userInfo.status.optionC', len: 2, pid: 'C' },
          { sort: 4, bid: 'A', type: 'userInfo.type.optionA', status: 'userInfo.status.optionD', len: 4, pid: 'D' },
        ],
      },
      {
        title: 'userInfo.tab.one',
        value: 2,
        list: [
          { sort: 1, bid: 'B', type: 'userInfo.type.optionB', status: 'userInfo.status.optionB', len: 4, pid: 'B' },
          { sort: 2, bid: 'C', type: 'userInfo.type.optionC', status: 'userInfo.status.optionA', len: 6, pid: 'A' },
          { sort: 3, bid: 'A', type: 'userInfo.type.optionA', status: 'userInfo.status.optionC', len: 2, pid: 'C' },
        ],
      },
    ],
  },
};
