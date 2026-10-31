<script lang="ts" setup>
import TinyEditor from '@opentiny/fluent-editor'
import { Modal, Button as TinyButton, Input as TinyInput } from '@opentiny/vue'
import { iconAdd, iconChevronLeft } from '@opentiny/vue-icon'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addDocument, richTextDocuments, updateDocument } from '../mock'
import '@opentiny/fluent-editor/style.css'

const IconAdd = iconAdd()
const IconChevronLeft = iconChevronLeft()

const route = useRoute()
const router = useRouter()

const editorRef = ref<HTMLElement>()
const title = ref('')
const department = ref('')

let _editor: TinyEditor | null = null

// 无 id 参数时为新建文档模式，有 id 时为编辑已有文档模式；两种模式均为富文本可编辑状态
const isCreateMode = computed(() => route.query.id === undefined)

const activeDocument = computed(() => {
  const id = Number(route.query.id)
  return richTextDocuments.find(doc => doc.id === id)
})

function destroyEditor() {
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
  }
  _editor = null
}

function initEditor(content = '') {
  destroyEditor()
  _editor = new TinyEditor(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: [
        ['undo', 'redo'],
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block', 'link'],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['clean'],
      ],
    },
  })
  if (content) {
    _editor.clipboard.dangerouslyPasteHTML(content)
  }
}

function syncForm() {
  if (isCreateMode.value) {
    title.value = ''
    department.value = ''
    initEditor()
  }
  else {
    title.value = activeDocument.value?.name ?? ''
    department.value = activeDocument.value?.department ?? ''
    initEditor(activeDocument.value?.content ?? '')
  }
}

onMounted(syncForm)

watch(() => route.query.id, syncForm, { flush: 'post' })

onBeforeUnmount(() => {
  destroyEditor()
})

function goBack() {
  router.push({ name: 'Editor' })
}

function handleSelectDoc(id: number) {
  router.replace({ name: 'EditorCreate', query: { id } })
}

function handleCreateNew() {
  router.replace({ name: 'EditorCreate' })
}

function handleSave() {
  if (!title.value.trim()) {
    Modal.message({ message: '请输入文档标题', status: 'warning' })
    return
  }
  const content = _editor?.getSemanticHTML() ?? editorRef.value?.innerHTML ?? ''
  const data = {
    name: title.value.trim(),
    department: department.value.trim() || '未分类',
    content,
  }
  if (isCreateMode.value) {
    addDocument(data)
    Modal.message({ message: '保存成功', status: 'success' })
    router.push({ name: 'Editor' })
    return
  }
  updateDocument(Number(route.query.id), data)
  Modal.message({ message: '保存成功', status: 'success' })
}
</script>

<template>
  <div class="editor-create-page">
    <Breadcrumb :items="['menu.form', 'menu.form.editor', 'menu.form.editor.create']" />
    <div class="editor-create">
      <div class="editor-create-list">
        <div class="editor-create-back" @click="goBack">
          <span class="editor-create-back-icon"><IconChevronLeft /></span>
          <span class="editor-create-back-text">返回</span>
        </div>
        <div class="editor-create-new">
          <TinyButton :icon="IconAdd" style="width: 100%;" @click="handleCreateNew">
            新建文档
          </TinyButton>
        </div>
        <div class="editor-create-list-body">
          <div
            v-for="doc in richTextDocuments"
            :key="doc.id"
            class="editor-create-item"
            :class="{ 'editor-create-item--active': !isCreateMode && doc.id === activeDocument?.id }"
            @click="handleSelectDoc(doc.id)"
          >
            <div class="editor-create-item-name">
              {{ doc.name }}
            </div>
            <div class="editor-create-item-time">
              {{ doc.time }}
            </div>
          </div>
        </div>
      </div>
      <div class="editor-create-content">
        <div class="editor-create-content-header">
          <div class="editor-create-content-fields">
            <div class="editor-create-content-field">
              <span class="editor-create-content-label">标题</span>
              <TinyInput v-model="title" placeholder="请输入文档标题" class="editor-create-content-input" />
            </div>
            <div class="editor-create-content-field">
              <span class="editor-create-content-label">部门</span>
              <TinyInput v-model="department" placeholder="请输入所属部门" class="editor-create-content-input" />
            </div>
          </div>
          <TinyButton type="primary" @click="handleSave">
            保存
          </TinyButton>
        </div>
        <div class="editor-create-editor-scroll">
          <div ref="editorRef" class="editor-create-content-editor" />
        </div>
        <div class="editor-desc">
          <a href="https://docs.opentiny.design/tiny-editor/guide/quick-start.html" target="_blank" rel="noopener noreferrer">
            点击查看 → TinyEditor 官方文档
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.editor-create-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-create {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 10px;
}

.editor-create-list {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 300px;
  padding: 20px;
  border-right: 1px solid #e8e8e8;
}

.editor-create-list-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.editor-create-back {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 8px;
  margin-bottom: 20px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #1890ff;
  }
}

.editor-create-back-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  font-size: 16px;
}

.editor-create-back-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}

.editor-create-new {
  margin-bottom: 20px;
}

.editor-create-item {
  height: 76px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  background: #ffffff;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f6f8f9;
  }
}

.editor-create-item--active {
  background: #f6f8f9;
}

.editor-create-item-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #333;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.editor-create-item-time {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  color: #666;
}

.editor-create-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.editor-create-content-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 32px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.editor-create-content-fields {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.editor-create-content-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-create-content-label {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.editor-create-content-input {
  width: 260px;
  min-width: 0;
  flex-shrink: 1;
}

.editor-create-editor-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 32px 16px;

  :deep(.ql-toolbar) {
    position: sticky;
    top: 0;
    z-index: 5;
    background: #fff;
  }
}

.editor-create-content-editor {
  min-height: 0;
  height: 550px;
}

.editor-desc {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  font-size: 14px;
  color: #999;
  padding-bottom: 16px;

  a {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
