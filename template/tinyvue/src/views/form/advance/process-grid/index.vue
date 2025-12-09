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
      align="center"
    >
      <tiny-grid-column
        :title="$t('advanceForm.form.process.name')"
        field="name"
        min-width="120px"
        :show-icon="false"
        :editor="{ component: TinyInput, autoselect: true }"
        :renderer="defaultRender"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.number')"
        field="number"
        min-width="120px"
        :show-icon="false"
        :editor="{ component: TinyInput, autoselect: true }"
        :renderer="defaultRender"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.department')"
        field="department"
        min-width="120px"
        :show-icon="false"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: options.department,
          },
        }"
      >
        <template #default="data">
          <SelectRender
            :data="data"
            :options="options.department"
            field="department"
          ></SelectRender>
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.status')"
        field="status"
        :show-icon="false"
        min-width="120px"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: options.status,
          },
        }"
      >
        <template #default="data">
          <selectRender
            :data="data"
            :options="options.status"
            field="status"
          ></selectRender>
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.runningStatus')"
        field="runningStatus"
        :show-icon="false"
        min-width="120px"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: options.status,
          },
        }"
        :renderer="{ component: StatusRender }"
      >
      </tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.createTime')"
        field="createTime"
        :show-icon="false"
        min-width="160px"
        :editor="{
          component: TinyDatePicker,
          autoselect: true,
          attrs: {
            type: 'datetime',
          },
        }"
        format-text="longDateTime"
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('advanceForm.form.process.operation')"
        field="operation"
        min-width="120px"
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
          <a
            v-if="!$refs.gridRef.hasActiveRow(data.row)"
            class="mr-2"
            @click="editRow(data.row)"
          >
            <IconEdit class="operation-icon"></IconEdit
            >{{ $t('advanceForm.form.process.edit') }}
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
<script lang="ts" setup>
  import {
    TinyInput,
    TinySelect,
    TinyGrid,
    TinyGridColumn,
    TinyButton,
    TinyPopconfirm,
    Modal,
    TinyDatePicker,
    TinyPager,
    TinyTag,
  } from '@opentiny/vue';
  import { iconSave, iconDel, iconEdit } from '@opentiny/vue-icon';
  import { t } from '@opentiny/vue-locale';
  import { useDateFormat } from '@vueuse/core';
  import { ref } from 'vue';
  import StatusRender from './status-render.vue';
  import SelectRender from './select-render.vue';

  defineProps({
    options: {
      type: {
        status: [],
        department: [],
      },
      default: {},
    },
  });

  const gridRef = ref('gridRef');
  const IconDel = iconDel();
  const IconSave = iconSave();
  const IconEdit = iconEdit();

  const gridTable = ref({
    data: [
      {
        name: '黄芊义',
        number: 'a00101227',
        department: '1',
        status: 'running',
        runningStatus: 'finished',
        createTime: new Date(),
      },
    ],
  });

  const defaultRender = (h, { row, column }) => {
    return row[column.property] ?? '--';
  };

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

  const editRow = (row) => {
    gridRef.value.setActiveRow(row);
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
