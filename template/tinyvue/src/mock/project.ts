import { successResponseWrap } from '../utils/setup-mock'

export interface ProjectRecord {
  id: string
  projectName: string
  projectCode: string
  projectStatus: string
  taskStatus: string
  department: string
  startTime: string
  endTime: string
  priority: string
  owner: string
}

const projectNames = [
  '智慧园区管理平台',
  '统一支付结算中心',
  '数据中台建设',
  '移动办公门户',
  '客户关系管理系统',
  '供应链协同平台',
  '智能客服机器人',
  '大数据分析平台',
  'DevOps 流水线改造',
  '云原生迁移项目',
  '风控决策引擎',
  '电子合同签署平台',
  '会员营销系统',
  'IoT 设备接入平台',
  '可视化报表中心',
]

const departments = [
  '平台技术部',
  '金融事业部',
  '企业应用部',
  '数据智能部',
  '创新业务部',
]

const owners = [
  '张伟',
  '李娜',
  '王强',
  '赵敏',
  '陈杰',
  '杨柳',
  '周涛',
  '吴倩',
  '郑浩',
  '孙丽',
]

const projectStatuses = ['0', '1', '2', '3']
const taskStatuses = ['0', '1', '2']
const priorities = ['0', '1', '2']

function pad(num: number) {
  return String(num).padStart(2, '0')
}

function randomDate(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1).getTime()
  const end = new Date(endYear, 11, 31).getTime()
  const date = new Date(start + Math.random() * (end - start))
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pick<T>(list: T[], index: number): T {
  return list[index % list.length]
}

function createProjectList(count: number): ProjectRecord[] {
  const list: ProjectRecord[] = []
  for (let i = 0; i < count; i += 1) {
    const startTime = randomDate(2023, 2025)
    list.push({
      id: String(i + 1),
      projectName: pick(projectNames, i),
      projectCode: `PRJ-${2024 + (i % 2)}-${pad((i % 60) + 1)}`,
      projectStatus: pick(projectStatuses, i),
      taskStatus: pick(taskStatuses, i * 2 + 1),
      department: pick(departments, i * 3 + 2),
      startTime,
      endTime: randomDate(2025, 2027),
      priority: pick(priorities, i * 5 + 1),
      owner: pick(owners, i * 7 + 3),
    })
  }
  return list
}

const projects: ProjectRecord[] = createProjectList(60)

let nextProjectId = projects.length + 1

export default [
  {
    url: '/api/project/getProjectList',
    method: 'post',
    response: () => {
      return successResponseWrap(projects)
    },
  },
  {
    url: '/api/project/create',
    method: 'post',
    response: ({ body }: { body?: { data?: Partial<ProjectRecord> } }) => {
      const record: ProjectRecord = { ...(body?.data as ProjectRecord), id: String(nextProjectId++) }
      const index = projects.findIndex(item => item.id === String(body?.data?.id ?? ''))
      if (index > -1)
        projects[index] = record
      else
        projects.unshift(record)
      return successResponseWrap(record)
    },
  },
  {
    url: '/api/project/update',
    method: 'post',
    response: ({ body }: { body?: { data?: Partial<ProjectRecord> } }) => {
      const index = projects.findIndex(item => item.id === String(body?.data?.id ?? ''))
      if (index > -1)
        projects[index] = { ...projects[index], ...body?.data } as ProjectRecord
      return successResponseWrap(true)
    },
  },
  {
    url: '/api/project/delete',
    method: 'delete',
    response: ({ query }: { query: URLSearchParams }) => {
      const id = query.get('id')
      const index = projects.findIndex(item => item.id === id)
      if (index > -1)
        projects.splice(index, 1)
      return successResponseWrap(true)
    },
  },
] as any
