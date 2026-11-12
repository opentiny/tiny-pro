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
import { t } from '@opentiny/vue-locale'
import { computed, onMounted, ref } from 'vue'
import { queryProjectList } from '@/api/project'

// 项目基本信息，取自项目管理 mock 数据中的第一条
const project = ref<ProjectInfo | null>(null)

// 展示用的文本补充信息
const extraInfo = ref({
  goal: '打造统一的项目管理平台，实现项目全生命周期的数字化管控，提升跨部门协作效率。',
  technology: 'Vue3 + TypeScript + TinyVue / NestJS / PostgreSQL',
  partner: '质量管理部、运维中心、用户体验部',
  quality: '核心接口自动化测试覆盖率不低于 80%，生产缺陷密度低于 0.5 个/功能点',
  remark: '项目整体进度符合预期，需重点关注第三方接口联调的排期风险。',
})

// 周期与资源类指标随项目状态推导，保证与所选项目阶段一致
const scheduleByStatus: Record<string, { manHours: number, budget: number, teamSize: number, riskLevel: string }> = {
  0: { manHours: 40, budget: 20, teamSize: 5, riskLevel: '低' },
  1: { manHours: 320, budget: 180, teamSize: 12, riskLevel: '中' },
  2: { manHours: 560, budget: 260, teamSize: 12, riskLevel: '低' },
  3: { manHours: 210, budget: 120, teamSize: 8, riskLevel: '高' },
}

const schedule = computed(() => {
  if (!project.value)
    return null
  return scheduleByStatus[project.value.projectStatus] ?? scheduleByStatus[1]
})

// 当前进度随项目状态推导，保证与所选项目一致
const progressByStatus: Record<string, number> = {
  0: 5,
  1: 65,
  2: 100,
  3: 40,
}

const progress = computed(() => {
  if (!project.value)
    return null
  return progressByStatus[project.value.projectStatus] ?? 65
})

const projectStatusOptions = [
  { value: '0', label: 'advancedList.status.notStarted' },
  { value: '1', label: 'advancedList.status.inProgress' },
  { value: '2', label: 'advancedList.status.completed' },
  { value: '3', label: 'advancedList.status.paused' },
]

const priorityOptions = [
  { value: '0', label: 'advancedList.priority.high' },
  { value: '1', label: 'advancedList.priority.medium' },
  { value: '2', label: 'advancedList.priority.low' },
]

const riskOptions = [
  { value: '高', label: 'advancedList.priority.high' },
  { value: '中', label: 'advancedList.priority.medium' },
  { value: '低', label: 'advancedList.priority.low' },
]

// 第一模块：项目进度（横向步骤条）
const stepNodeKeys = [
  'profileDetail.steps.initiation',
  'profileDetail.steps.review',
  'profileDetail.steps.development',
  'profileDetail.steps.testing',
  'profileDetail.steps.release',
  'profileDetail.steps.acceptance',
]

const statusDoneCount: Record<string, number> = {
  0: 0,
  1: 2,
  2: 6,
  3: 3,
}

const stepsData = computed(() => {
  if (!project.value)
    return []
  const doneCount = statusDoneCount[project.value.projectStatus] ?? 2
  const paused = project.value.projectStatus === '3'
  return stepNodeKeys.map((key, index) => {
    const name = t(key)
    if (index < doneCount)
      return { name, status: 'done' }
    if (index === doneCount)
      return { name, status: paused ? 'error' : 'doing' }
    return { name }
  })
})

const activeStep = computed(() => {
  if (!project.value)
    return 0
  const doneCount = statusDoneCount[project.value.projectStatus] ?? 2
  return Math.min(doneCount, stepNodeKeys.length - 1)
})

// 第五模块：版本发布记录（模拟数据）
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

// 各项目状态下可见的版本记录，保证与所选项目阶段一致
const versionStatusByProjectStatus: Record<string, string[]> = {
  0: ['2'],
  1: ['0', '1', '2'],
  2: ['0'],
  3: ['0', '2'],
}

const versionList = computed(() => {
  if (!project.value)
    return []
  const allowed = versionStatusByProjectStatus[project.value.projectStatus] ?? versionStatusByProjectStatus[1]
  return versionData.filter(item => allowed.includes(item.status))
})

const versionStatusLabel: Record<string, string> = {
  0: 'profileDetail.versions.published',
  1: 'profileDetail.versions.prerelease',
  2: 'profileDetail.versions.planned',
}

const versionStatusTagType: Record<string, string> = {
  0: 'success',
  1: 'warning',
  2: 'info',
}

async function fetchData() {
  const { data } = await queryProjectList()
  project.value = data[0] ?? null
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
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.progress') }}</span>
          <TinyTag v-if="project" :type="{ 0: '', 1: 'success', 2: 'primary', 3: 'warning' }[project.projectStatus]">
            {{ $t(projectStatusOptions.find(item => item.value === project?.projectStatus)?.label ?? '') }}
          </TinyTag>
          <span v-else>-</span>
        </div>
        <div class="card-desc">
          {{ project ? `${project.projectName}（${project.projectCode}）` : '-' }}
        </div>
        <TinySteps v-if="project" line :data="stepsData" :active="activeStep" :visible-num="6" class="project-steps" />
        <span v-else>-</span>
      </div>

      <!-- 模块二：基本信息 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.basicInfo') }}</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem :label="$t('profileDetail.form.projectName')">
            <TinyInput :model-value="project?.projectName ?? '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.projectCode')">
            <TinyInput :model-value="project?.projectCode ?? '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.projectStatus')">
            <TinySelect :model-value="project ? project.projectStatus : '-'">
              <TinyOption
                v-for="option in projectStatusOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.priority')">
            <TinySelect :model-value="project ? project.priority : '-'">
              <TinyOption
                v-for="option in priorityOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.owner')">
            <TinyInput :model-value="project?.owner ?? '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.department')">
            <TinyInput :model-value="project?.department ?? '-'" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块三：周期与资源 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.schedule') }}</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem :label="$t('profileDetail.form.startTime')">
            <TinyDatePicker :model-value="project?.startTime ?? '-'" type="date" value-format="yyyy-MM-dd" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.endTime')">
            <TinyDatePicker :model-value="project?.endTime ?? '-'" type="date" value-format="yyyy-MM-dd" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.progress')">
            <TinyNumeric v-if="project" :model-value="progress" unit="%" />
            <span v-else>-</span>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.manHours')">
            <TinyNumeric v-if="project" :model-value="schedule?.manHours" unit="人日" />
            <span v-else>-</span>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.budget')">
            <TinyNumeric v-if="project" :model-value="schedule?.budget" unit="万元" />
            <span v-else>-</span>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.teamSize')">
            <TinyNumeric v-if="project" :model-value="schedule?.teamSize" unit="人" />
            <span v-else>-</span>
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块四：目标与风险 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.goalRisk') }}</span>
        </div>
        <TinyForm class="detail-form" display-only label-position="top">
          <TinyFormItem :label="$t('profileDetail.form.goal')">
            <TinyInput :model-value="project ? extraInfo.goal : '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.technology')">
            <TinyInput :model-value="project ? extraInfo.technology : '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.partner')">
            <TinyInput :model-value="project ? extraInfo.partner : '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.riskLevel')">
            <TinySelect :model-value="project ? schedule?.riskLevel : '-'">
              <TinyOption
                v-for="option in riskOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              />
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.quality')">
            <TinyInput :model-value="project ? extraInfo.quality : '-'" />
          </TinyFormItem>
          <TinyFormItem :label="$t('profileDetail.form.remark')">
            <TinyInput :model-value="project ? extraInfo.remark : '-'" type="textarea" />
          </TinyFormItem>
        </TinyForm>
      </div>

      <!-- 模块五：版本发布记录 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">{{ $t('profileDetail.card.versions') }}</span>
        </div>
        <TinyGrid :data="versionList" row-id="id" align="center">
          <TinyGridColumn field="version" :title="$t('profileDetail.versions.version')" width="120" />
          <TinyGridColumn field="date" :title="$t('profileDetail.versions.date')" width="120" />
          <TinyGridColumn field="content" :title="$t('profileDetail.versions.content')" show-overflow />
          <TinyGridColumn field="status" :title="$t('profileDetail.versions.status')" width="100">
            <template #default="{ row }">
              <TinyTag :type="versionStatusTagType[row.status]">
                {{ $t(versionStatusLabel[row.status]) }}
              </TinyTag>
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="owner" :title="$t('profileDetail.versions.owner')" width="110" />
        </TinyGrid>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import './detail.less';
</style>
