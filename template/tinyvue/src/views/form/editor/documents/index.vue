<script lang="ts" setup>
import { Modal, Grid as TinyGrid, GridColumn as TinyGridColumn } from '@opentiny/vue'
import { useRouter } from 'vue-router'
import { removeDocument, richTextDocuments } from '../mock'

const router = useRouter()

function handleCellClick({ row }: any, event: MouseEvent) {
  // 点击“删除”等操作列时不触发行跳转
  if ((event.target as HTMLElement).closest('.editor-documents-delete')) {
    return
  }
  router.push({ name: 'EditorCreate', query: { id: row.id } })
}

function handleDelete(row: any) {
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除文档「${row.name}」吗？删除后不可恢复。`,
  }).then((res: string) => {
    if (res === 'confirm') {
      removeDocument(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
    }
  })
}
</script>

<template>
  <div class="editor-documents">
    <div class="editor-documents-header">
      <h3 class="editor-documents-title">
        文档列表
      </h3>
    </div>
    <TinyGrid :data="richTextDocuments" :show-header="false" border @cell-click="handleCellClick">
      <TinyGridColumn field="name" title="文档名称" />
      <TinyGridColumn field="department" title="部门" width="180" />
      <TinyGridColumn field="time" title="时间" width="220" />
      <TinyGridColumn title="操作" width="90" align="center">
        <template #default="{ row }">
          <span class="editor-documents-delete" @click.stop="handleDelete(row)">删除</span>
        </template>
      </TinyGridColumn>
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.editor-documents {
  padding: 24px 32px;
}

.editor-documents-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.editor-documents-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.editor-documents-delete {
  font-size: 13px;
  color: #f56c6c;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
