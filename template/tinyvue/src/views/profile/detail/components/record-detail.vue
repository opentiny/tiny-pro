<template>
  <div class="record-detail">
    <div class="detail-header">{{ $t('baseForm.form.record') }}</div>
    <div class="detail-row" noSpace>
      <tiny-grid
        :data="
          tableData.slice(
            (custPager.currentPage - 1) * custPager.pageSize,
            (custPager.currentPage - 1) * custPager.pageSize +
              custPager.pageSize,
          )
        "
        seq-serial
        auto-resize
      >
        <tiny-grid-column
          :title="$t('home.roundtable.index')"
          type="index"
          align="left"
        ></tiny-grid-column>
        <tiny-grid-column
          field="version"
          :title="$t('menu.plan.version')"
        ></tiny-grid-column>
        <tiny-grid-column
          field="operation"
          :title="$t('menu.plan.operation')"
        ></tiny-grid-column>
        <tiny-grid-column
          field="updated"
          :title="$t('menu.plan.updated')"
        ></tiny-grid-column>
        <tiny-grid-column
          field="time"
          :title="$t('menu.plan.time')"
          show-overflow
        ></tiny-grid-column>
      </tiny-grid>
      <tiny-pager
        :current-page="custPager.currentPage"
        :page-size="custPager.pageSize"
        :total="tableData.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="currentChange"
        @size-change="sizeChange"
      ></tiny-pager>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, ref, toRefs } from 'vue';
  import {
    Row as TinyRow,
    Grid as TinyGrid,
    GridColumn as TinyGridColumn,
    Pager as TinyPager,
  } from '@opentiny/vue';

  // 父组件传值
  const props = defineProps({
    tableData: [],
  });

  const { tableData } = toRefs(props);
  const custPager = ref({
    currentPage: 1,
    pageSize: 5,
  });

  const currentChange = (current) => {
    custPager.value.currentPage = current;
  };

  const sizeChange = (size) => {
    custPager.value.pageSize = size;
  };
</script>
