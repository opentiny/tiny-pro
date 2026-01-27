<script lang="ts" setup>
import type { DetailTableData } from '@/api/profile'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Pager as TinyPager,
} from '@opentiny/vue'
import { computed, ref } from 'vue'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'

const { tableData } = defineProps<{ tableData: DetailTableData[] }>()

const { gridSize } = useResponsiveSize()
const { sm } = useResponsive()

const pagerLayout = computed(() =>
  sm.value ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper',
)

const custPager = ref({
  currentPage: 1,
  pageSize: 5,
})

function currentChange(current: number) {
  custPager.value.currentPage = current
}

function sizeChange(size: number) {
  custPager.value.pageSize = size
}

const listData = computed(() => {
  const start = (custPager.value.currentPage - 1) * custPager.value.pageSize
  const end = (custPager.value.currentPage - 1) * custPager.value.pageSize + custPager.value.pageSize
  return tableData.slice(start, end)
})
</script>

<template>
  <div class="record-detail">
    <div class="detail-header">
      {{ $t('baseForm.form.record') }}
    </div>
    <div class="detail-row" noSpace>
      <TinyGrid
        :data="listData"
        seq-serial
        auto-resize
        :size="gridSize"
        align="center"
      >
        <TinyGridColumn
          :title="$t('home.roundtable.index')"
          type="index"
          align="left"
        />
        <TinyGridColumn
          field="version"
          :title="$t('menu.plan.version')"
        />
        <TinyGridColumn
          field="operation"
          :title="$t('menu.plan.operation')"
        />
        <TinyGridColumn
          field="updated"
          :title="$t('menu.plan.updated')"
        />
        <TinyGridColumn
          field="time"
          :title="$t('menu.plan.time')"
          show-overflow="false"
        />
      </TinyGrid>
      <TinyPager
        :current-page="custPager.currentPage"
        :page-size="custPager.pageSize"
        :total="tableData.length"
        :page-sizes="[10, 20, 50, 100]"
        :layout="pagerLayout"
        @current-change="currentChange"
        @size-change="sizeChange"
      />
    </div>
  </div>
</template>

<style lang="less" scoped></style>
