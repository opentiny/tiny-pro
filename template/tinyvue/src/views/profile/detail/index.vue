<script lang="ts" setup>
import type { ProjectInfo } from '@/api/project'
import {
  DatePicker as TinyDatePicker,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Input as TinyInput,
  Numeric as TinyNumeric,
  Option as TinyOption,
  Select as TinySelect,
  Steps as TinySteps,
  Tag as TinyTag,
} from '@opentiny/vue'
import { computed, onMounted, ref } from 'vue'
import { queryProjectList } from '@/api/project'

// 项目基本信息，取自项目管理 mock 数据中的第一条
const project = ref<ProjectInfo | null>(null)

// 展示用的补充信息（mock 数据之外即兴补充）
const extraInfo = ref({
  progress: 65,
  manHours: 320,
  budget: 180,
  teamSize: 12,
  goal: '打造统一的项目管理平台，实现项目全生命周期的数字化管控，提升跨部门协作效率。',
  technology: 'Vue3 + TypeScript + TinyVue / NestJS / PostgreSQL',
  partner: '质量管理部、运维中心、用户体验部',
  riskLevel: '中',
  quality: '核心接口自动化测试覆盖率不低于 80%，生产缺陷密度低于 0.5 个/功能点',
  remark: '项目整体进度符合预期，需重点关注第三方接口联调的排期风险。',
})

const projectStatusOptions = [
  { value: '0', label: '未开始' },
  { value: '1', label: '进行中' },
  { value: '2', label: '已完成' },
  { value: '3', label: '已暂停' },
]

const priorityOptions = [
  { value: '0', label: '高' },
  { value: '1', label: '中' },
  { value: '2', label: '低' },
]

const riskOptions = ['高', '中', '低'].map(value => ({ value, label: value }))

// 第一模块：项目进度（横向步骤条）
const stepNodes = ['立项申请', '需求评审', '开发实施', '联调测试', '上线发布', '验收归档']

const statusDoneCount: Record<string, number> = {
  0: 0,
  1: 2,
  2: 6,
  3: 3,
}

const stepsData = computed(() => {
  const doneCount = statusDoneCount[project.value?.projectStatus ?? '1'] ?? 2
  const paused = project.value?.projectStatus === '3'
  return stepNodes.map((name, index) => {
    if (index < doneCount)
      return { name, status: 'done' }
    if (index === doneCount)
      return { name, status: paused ? 'error' : 'doing' }
    return { name }
  })
})

const activeStep = computed(() => {
  const doneCount = statusDoneCount[project.value?.projectStatus ?? '1'] ?? 2
  return Math.min(doneCount, stepNodes.length - 1)
})

// 第五模块：版本发布记录（模拟数据）
const versionList = ref<ProjectVersion[]>([])

interface ProjectVersion {
  id: string
  version: string
  date: string
  content: string
  status: string
  owner: string
}

const versionData: ProjectVersion[] = [
  { id: '1', version: 'V1.4.0', date: '2025-11-20', content: '新增项目风险预警看板，优化任务甘特图交互', status: '0', owner: '张伟' },
  { id: '2', version: 'V1.3.2', date: '2025-09-08', content: '修复大数据量下表格滚动卡顿问题', status: '0', owner: '李娜' },
  { id: '3', version: 'V1.3.0', date: '2025-07-15', content: '支持自定义项目模板与批量导入任务', status: '0', owner: '王强' },
  { id: '4', version: 'V1.2.0', date: '2025-04-30', content: '上线项目文档中心与评论提醒', status: '0', owner: '赵敏' },
  { id: '5', version: 'V1.1.0-beta', date: '2026-01-10', content: '移动端适配（公测中），开放只读分享链接', status: '1', owner: '陈杰' },
  { id: '6', version: 'V1.5.0', date: '-', content: '多项目组合管理与资源负荷视图（规划中）', status: '2', owner: '杨柳' },
]

const versionStatusLabel: Record<string, string> = {
  0: '已发布',
  1: '预发布',
  2: '规划中',
}

const versionStatusTagType: Record<string, string> = {
  0: 'success',
  1: 'warning',
  2: 'info',
}

async function fetchData() {
  const { data } = await queryProjectList()
  project.value = data[0] ?? null
  versionList.value = [...versionData]
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="project-detail-container">
    <Breadcrumb :items="['menu.profile', 'menu.profile.detail']" />

    <div class="detail-wrapper">
      <!-- 模块一：项目进度 -->
      <div v-if="project" class="detail-card">
        <div class="card-header">
          <span class="card-title">项目进度</span>
          <TinyTag :type="{ 0: '', 1: 'success', 2: 'primary', 3: 'warning' }[project.projectStatus]">
            {{ projectStatusOptions.find(item => item.value === project.projectStatus)?.label }}
          </TinyTag>
        </div>
        <div class="card-desc">
          {{ project.projectName }}（{{ project.projectCode }}）
        </div>
        <TinySteps line :data="stepsData" :active="activeStep" :visible-num="6" class="project-steps" />
      </div>

      <!-- 模块二：基本信息 -->
      <div v-if="project" class="detail-card">
        <div class="card-header">
          <span class="card-title">基本信息</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem label="项目名称">
            <TinyInput v-model="project.projectName" />
          </TinyFormItem>
          <TinyFormItem label="项目编号">
            <TinyInput v-model="project.projectCode" />
          </TinyFormItem>
          <TinyFormItem label="项目状态">
            <TinySelect v-model="project.projectStatus">
              <TinyOption
                v-for="option in projectStatusOptions" :key="option.value" :value="option.value"
                :label="option.label"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem label="项目优先级">
            <TinySelect v-model="project.priority">
              <TinyOption
                v-for="option in priorityOptions" :key="option.value" :value="option.value"
                :label="option.label"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem label="项目负责人">
            <TinyInput v-model="project.owner" />
          </TinyFormItem>
          <TinyFormItem label="项目发起部门">
            <TinyInput v-model="project.department" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块三：周期与资源 -->
      <div v-if="project" class="detail-card">
        <div class="card-header">
          <span class="card-title">周期与资源</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem label="项目开始时间">
            <TinyDatePicker v-model="project.startTime" type="date" value-format="yyyy-MM-dd" />
          </TinyFormItem>
          <TinyFormItem label="项目结束时间">
            <TinyDatePicker v-model="project.endTime" type="date" value-format="yyyy-MM-dd" />
          </TinyFormItem>
          <TinyFormItem label="当前进度">
            <TinyNumeric v-model="extraInfo.progress" unit="%" />
          </TinyFormItem>
          <TinyFormItem label="已投入工时">
            <TinyNumeric v-model="extraInfo.manHours" unit="人日" />
          </TinyFormItem>
          <TinyFormItem label="项目预算">
            <TinyNumeric v-model="extraInfo.budget" unit="万元" />
          </TinyFormItem>
          <TinyFormItem label="团队规模">
            <TinyNumeric v-model="extraInfo.teamSize" unit="人" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块四：目标与风险 -->
      <div v-if="project" class="detail-card">
        <div class="card-header">
          <span class="card-title">目标与风险</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem label="项目目标">
            <TinyInput v-model="extraInfo.goal" />
          </TinyFormItem>
          <TinyFormItem label="核心技术">
            <TinyInput v-model="extraInfo.technology" />
          </TinyFormItem>
          <TinyFormItem label="协作部门">
            <TinyInput v-model="extraInfo.partner" />
          </TinyFormItem>
          <TinyFormItem label="风险等级">
            <TinySelect v-model="extraInfo.riskLevel">
              <TinyOption
                v-for="option in riskOptions" :key="option.value" :value="option.value"
                :label="option.label"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem label="质量要求">
            <TinyInput v-model="extraInfo.quality" />
          </TinyFormItem>
          <TinyFormItem label="备注说明">
            <TinyInput v-model="extraInfo.remark" type="textarea" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块五：版本发布记录 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">版本发布记录</span>
        </div>
        <TinyGrid :data="versionList" row-id="id" align="center">
          <TinyGridColumn field="version" title="版本号" width="120" />
          <TinyGridColumn field="date" title="发布时间" width="120" />
          <TinyGridColumn field="content" title="更新内容" show-overflow />
          <TinyGridColumn field="status" title="状态" width="100">
            <template #default="{ row }">
              <TinyTag :type="versionStatusTagType[row.status]">
                {{ versionStatusLabel[row.status] }}
              </TinyTag>
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="owner" title="发布负责人" width="110" />
        </TinyGrid>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import './detail.less';
</style>
