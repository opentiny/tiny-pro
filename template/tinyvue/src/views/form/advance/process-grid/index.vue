<template lang="">
  <div>
    <div class="mb-4">
      <tiny-button @click="addRow">{{
        $t('advanceForm.form.process.add')
      }}</tiny-button>
    </div>
    <tiny-grid
      ref="gridRef"
      :data="gridTable.data"
      :edit-config="{
        trigger: 'manual',
        mode: 'row',
        autoClear: false,
        showStatus: true,
      }"
    >
      <tiny-grid-column
        :title="$t('advanceForm.form.process.name')"
        field="name"
        :show-icon="false"
        :editor="{ component: 'input', autoselect: true }"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.number')"
        field="number"
        :show-icon="false"
        :editor="{ component: 'input', autoselect: true }"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.department')"
        field="department"
        :show-icon="false"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: departmentOptions,
          },
        }"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.status')"
        field="status"
        :show-icon="false"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: statusOptions,
          },
        }"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.runningStatus')"
        field="runningStatus"
        :show-icon="false"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: runningStatusOptions,
          },
        }"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.createTime')"
        field="createTime"
        :show-icon="false"
        :editor="{ component: TinyTimeSelect, autoselect: true }"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.operation')"
        field="operation"
      >
        <template #default="data">
          <a
            v-if="$refs.gridRef && $refs.gridRef.hasActiveRow(data.row)"
            class="mr-2"
            @click="saveRow(data.row)"
          >
            <IconSave class="operation-icon"></IconSave
            >{{ $t('advanceForm.form.process.save') }}
          </a>
          <tiny-popconfirm
            :title="$t('advanceForm.form.delete.title')"
            type="warning"
            trigger="click"
            @confirm="deleteRow(data.row)"
          >
            <template #reference>
              <a class="operation">
                <IconDel class="operation-icon"></IconDel
                >{{ $t('advanceForm.form.process.delete') }}
              </a>
            </template>
          </tiny-popconfirm>
        </template>
      </tiny-grid-column>
      <template #empty>
        <span>{{ $t('advanceForm.form.nodata') }}</span>
      </template>
    </tiny-grid>
  </div>
</template>
<script setup>
  import {
    TinySelect,
    TinyGrid,
    TinyGridColumn,
    TinyButton,
    TinyNotify,
    TinyTimeSelect,
    TinyPopconfirm,
    Modal,
  } from '@opentiny/vue';
  import { iconSave, iconDel } from '@opentiny/vue-icon';
  import { t } from '@opentiny/vue-locale';
  import { ref } from 'vue';

  const gridRef = ref('gridRef');
  const IconDel = iconDel();
  const IconSave = iconSave();

  const gridTable = ref({
    data: [
      {
        name: '黄芊义',
        number: 'a00101227',
        department: '中软',
        status: '运行中',
        runningStatus: '进行中',
        createTime: '111111',
      },
    ],
  });

  const departmentOptions = ref([
    {
      label: '中软',
      value: '中软',
    },
    { label: '软通', value: '软通' },
  ]);
  const statusOptions = ref([
    {
      label: '运行中',
      value: '运行中',
    },
  ]);
  const runningStatusOptions = ref([
    {
      label: '进行中',
      value: '进行中',
    },
    { label: '已完成', value: '已完成' },
  ]);

  const addRow = () => {
    if (gridRef.value.getActiveRow()) {
      Modal.message({
        message: t('advanceForm.form.validError.add'),
        status: 'warning',
      });

      return;
    }
    gridRef.value.insert({}).then((res) => {
      gridRef.value.setActiveRow(res.row);
    });
  };

  const saveRow = (row) => {
    gridRef.value.clearActived();
  };

  const deleteRow = (row) => {
    gridRef.value.remove(row);
  };

  const resetGrid = () => {
    gridTable.value.data = [];
  };

  defineExpose({
    resetGrid,
  });
</script>
<style scoped lang="less">
  .operation-icon {
    margin-right: 3px;
    fill: currentColor;
  }
</style>
