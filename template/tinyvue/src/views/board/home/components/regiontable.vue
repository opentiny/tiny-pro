<script lang="ts" setup>
import {
  Pager,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
} from '@opentiny/vue'
import { ref } from 'vue'
import { useResponsiveSize } from '@/hooks/responsive'

const { gridSize } = useResponsiveSize()

const tableData = [
  {
    id: '1',
    space: '上海',
    pv: '1767(97.77%)',
    play: '0.44s',
    page: '2.7s',
  },
  {
    id: '2',
    space: '香港',
    pv: '22(1.77%)',
    play: '0.43s',
    page: '1.1s',
  },
  {
    id: '3',
    space: '北京',
    pv: '32(1.77%)',
    play: '0.44s',
    page: '1.7s',
  },
  {
    id: '4',
    space: '广东',
    pv: '32(1.77%)',
    play: '0.44s',
    page: '1.7s',
  },
  {
    id: '5',
    space: '江苏',
    pv: '16(0.88%)',
    play: '0.66s',
    page: '3.12s',
  },
  {
    id: '6',
    space: '福建',
    pv: '1765(97.35%)',
    play: '0.44s',
    page: '1.7s',
  },
  {
    id: '7',
    space: '四川',
    pv: '32(1.77%)',
    play: '0.65s',
    page: '2.92s',
  },
]

const pagerConfig = ref({
  component: Pager,
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    total: 0,
    align: 'right', // 可选值：['left', 'center', 'right']
    layout: 'total, sizes, prev, pager, next, jumper',
  },
})

const fetchData = ref({
  api: getData,
})

// 各排序字段的取值解析：pv/play/page 是带单位的字符串，需取数值部分比较
const sortParsers: Record<string, (v: string) => number> = {
  id: v => Number.parseInt(v, 10),
  pv: v => Number.parseFloat(v), // '1767(97.77%)' -> 1767
  play: v => Number.parseFloat(v), // '0.44s' -> 0.44
  page: v => Number.parseFloat(v),
}

function getData({ page, sort }: any) {
  const { currentPage, pageSize } = page
  const offset = (currentPage - 1) * pageSize

  const result = tableData.slice()

  // 排序：点击表头后 Grid 会把 { field, order } 传进来
  if (sort?.order) {
    const field: string = sort.field || sort.property
    const parse = sortParsers[field] ?? ((v: string) => v)
    result.sort((a: any, b: any) => {
      const diff = parse(a[field]) - parse(b[field])
      return sort.order === 'asc' ? diff : -diff
    })
  }

  return Promise.resolve({
    result: result.slice(offset, offset + pageSize),
    page: { total: tableData.length },
  })
}
</script>

<template>
  <div class="container">
    <TinyGrid
      :fetch-data="fetchData" :pager="pagerConfig"
      :size="gridSize" :auto-resize="true" align="center"
    >
      <TinyGridColumn field="id" :title="$t('home.roundtable.index')" width="16%" sortable />
      <TinyGridColumn field="space" :title="$t('home.region.title')" />
      <TinyGridColumn field="pv" :title="$t('home.roundtable.pv')" min-width="120" sortable />
      <TinyGridColumn field="play" :title="$t('home.roundtable.play')" sortable />
      <TinyGridColumn field="page" :title="$t('home.roundtable.page')" sortable />
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.container {
  width: inherit;
}
</style>
