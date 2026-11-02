<script lang="ts" setup>
import TinyEditor from '@opentiny/fluent-editor'
import { Modal, Dropdown as TinyDropdown, Input as TinyInput } from '@opentiny/vue'
import { iconAdd, iconChevronLeft, iconDel, iconEdit, iconEllipsis, iconError, iconFullscreenRight, iconGroup, IconLoadingShadow, iconMinscreenRight, iconSuccess, iconUser } from '@opentiny/vue-icon'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addCollaborationDocument,
  addDocument,
  collaborationDocuments,
  removeCollaborationDocument,
  removeDocument,
  richTextDocuments,
  updateCollaborationDocument,
  updateDocument,
} from '../mock'
import '@opentiny/fluent-editor/style.css'

const IconAdd = iconAdd()
const IconChevronLeft = iconChevronLeft()
const IconDel = iconDel()
const IconUser = iconUser()
const IconEllipsis = iconEllipsis()

const route = useRoute()
const router = useRouter()

const editorRef = ref<HTMLElement>()
const title = ref('')
const isFullscreen = ref(false)

let _editor: TinyEditor | null = null

// 协同编辑实例，销毁编辑器时必须一并清理，否则重复初始化会叠加连接与工具栏
let collabBinding: { destroy: () => void } | null = null
let collabProvider: { destroy: () => void, off?: (event: string, handler: (event: { status: string }) => void) => void } | null = null
let collabPersistence: { destroy: () => void } | null = null
let collabDoc: { destroy: () => void } | null = null
let collabAwareness: { off: (event: string, handler: () => void) => void } | null = null
let collabAwarenessHandler: (() => void) | null = null
let collabHeartbeatTimer: ReturnType<typeof setInterval> | null = null
// 当前房间的协作用户（awareness 实时同步）
const collabUsers = ref<{ name: string, color?: string }[]>([])
// 本机在协同房间中的用户身份，保存文档时写入成员列表
const currentCollabUser = ref<{ name: string, color?: string } | null>(null)
// 最多直接展示 3 个用户，其余收进 ellipsis 下拉
const MAX_VISIBLE_COLLAB_USERS = 3
const visibleUsers = computed(() => collabUsers.value.slice(0, MAX_VISIBLE_COLLAB_USERS))
const moreUsers = computed(() =>
  collabUsers.value.slice(MAX_VISIBLE_COLLAB_USERS).map(user => ({ label: user.name, icon: iconUser() })),
)
// 协同同步状态：connecting 连接中 / syncing 正在同步中 / connected 同步成功 / disconnected 同步失败
const collabSyncStatus = ref<'connecting' | 'syncing' | 'connected' | 'disconnected'>('connecting')
let collabStatusHandler: ((event: { status: string }) => void) | null = null

const IconSync = computed(() => {
  if (collabSyncStatus.value === 'connected') {
    return iconSuccess()
  }
  if (collabSyncStatus.value === 'disconnected') {
    return iconError()
  }
  return IconLoadingShadow()
})
const syncStatusText = computed(() => {
  if (collabSyncStatus.value === 'connected') {
    return '同步成功'
  }
  if (collabSyncStatus.value === 'disconnected') {
    return '同步失败'
  }
  if (collabSyncStatus.value === 'syncing') {
    return '正在同步中'
  }
  return '同步中…'
})
// 初始化代次：协同编辑器异步初始化，完成前若用户已切换文档，丢弃过期结果
let editorEpoch = 0
// 新建协同文档的临时房间号，首次自动保存拿到正式 id 前保持不变，避免中途换房间丢失内容
let collabRoomSeed = ''
// 当前用户是否真实编辑过内容（mock 内容回填不算），只有编辑过才写入文档成员
let hasUserContentEdit = false
// mock 内容回填标记，回填产生的 text-change 不算用户编辑
let isSeedingContent = false

// 无 id 参数时为新建文档模式，有 id 时为编辑已有文档模式；两种模式均为富文本可编辑状态
const isCreateMode = computed(() => route.query.id === undefined)

// 从多人协同列表进入时（from=collaboration）展示协同文档，否则展示开始创作文档
const isCollaborationMode = computed(() => route.query.from === 'collaboration')
const docList = computed(() => (isCollaborationMode.value ? collaborationDocuments : richTextDocuments))
// 新建模式下首次自动保存创建的文档 id（刻意不改 URL，避免 fullPath 变化导致整页重挂载）
const pendingDocId = ref<number | null>(null)
const activeDocument = computed(() => {
  const id = route.query.id !== undefined ? Number(route.query.id) : pendingDocId.value
  return docList.value.find(doc => doc.id === id)
})

// 已加载到编辑器的文档 id，初始为 null，避免新建模式（无 id）下被误判为“已加载”而跳过初始化
let loadedDocId: number | null = null

const TOOLBAR_OPTIONS = [
  ['undo', 'redo'],
  [{ header: [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block', 'link'],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['clean'],
]

function destroyEditor() {
  editorEpoch += 1
  if (collabHeartbeatTimer) {
    clearInterval(collabHeartbeatTimer)
    collabHeartbeatTimer = null
  }
  if (collabAwareness && collabAwarenessHandler) {
    collabAwareness.off('change', collabAwarenessHandler)
  }
  collabAwareness = null
  collabAwarenessHandler = null
  collabUsers.value = []
  currentCollabUser.value = null
  if (collabProvider?.off && collabStatusHandler) {
    collabProvider.off('status', collabStatusHandler)
  }
  collabStatusHandler = null
  collabSyncStatus.value = 'connecting'
  collabBinding?.destroy()
  collabBinding = null
  collabProvider?.destroy()
  collabProvider = null
  collabPersistence?.destroy()
  collabPersistence = null
  collabDoc?.destroy()
  collabDoc = null
  const container = editorRef.value
  if (container) {
    // 销毁时需一并移除，否则重复初始化会叠加工具栏
    container.parentElement?.querySelectorAll(':scope > .ql-toolbar').forEach(el => el.remove())
    container.innerHTML = ''
    container.classList.remove('ql-container', 'ql-snow', 'ql-blank', 'ql-disabled')
  }
  _editor = null
}

// 每个协同文档一个房间，已有文档按 id 区分，新建文档用临时种子房间
function currentCollabRoom(): string {
  const id = route.query.id !== undefined ? Number(route.query.id) : pendingDocId.value
  if (id != null) {
    return `tiny-pro-collab-${id}`
  }
  if (!collabRoomSeed) {
    collabRoomSeed = `tiny-pro-collab-new-${Math.random().toString(36).slice(2, 10)}`
  }
  return collabRoomSeed
}

function attachAutoSave(editor: TinyEditor) {
  editor.on('text-change', (_delta, _oldContents, source) => {
    if (source === 'user') {
      scheduleAutoSave()
    }
  })
}

function initEditor(content = '') {
  destroyEditor()
  hasUserContentEdit = false
  if (isCollaborationMode.value) {
    // 多人协同：实时协同编辑器，内容通过 yjs 在协作者间同步
    initCollabEditor(content)
    return
  }
  _editor = new TinyEditor(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: TOOLBAR_OPTIONS,
    },
  })
  attachAutoSave(_editor)
  if (content) {
    _editor.clipboard.dangerouslyPasteHTML(content)
  }
}

async function initCollabEditor(content: string) {
  const epoch = editorEpoch
  const [
    { default: QuillCursors },
    Y,
    { QuillBinding },
    { WebsocketProvider },
    { IndexeddbPersistence },
  ] = await Promise.all([
    import('quill-cursors'),
    import('yjs'),
    import('y-quill'),
    import('y-websocket'),
    import('y-indexeddb'),
  ])
  // 初始化期间用户已切换文档或离开页面，丢弃本次结果
  if (epoch !== editorEpoch || !editorRef.value) {
    return
  }
  TinyEditor.register('modules/cursors', QuillCursors, true)
  const room = currentCollabRoom()
  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', room, ydoc)
  const persistence = new IndexeddbPersistence(room, ydoc)
  collabDoc = ydoc
  collabProvider = provider
  collabPersistence = persistence
  collabSyncStatus.value = 'connecting'
  const onStatus = (event: { status: string }) => {
    collabSyncStatus.value = event.status === 'connected' ? 'connected' : 'disconnected'
  }
  provider.on('status', onStatus)
  collabStatusHandler = onStatus
  const ytext = ydoc.getText('quill')
  _editor = new TinyEditor(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: TOOLBAR_OPTIONS,
      cursors: true,
    },
  })
  attachAutoSave(_editor)
  // 本地编辑时进入“正在同步中”，停止输入一小段时间后视为同步完成回到“同步成功”
  // isSeedingContent 用于区分 mock 内容回填与真实编辑，回填不计入用户编辑
  _editor.on('text-change', (_delta, _oldContents, source) => {
    if (source !== 'user') {
      return
    }
    if (!isSeedingContent) {
      hasUserContentEdit = true
    }
    if (collabSyncStatus.value === 'connected') {
      collabSyncStatus.value = 'syncing'
    }
    if (collabSyncStatus.value === 'syncing') {
      if (syncBackTimer) {
        clearTimeout(syncBackTimer)
      }
      syncBackTimer = setTimeout(() => {
        syncBackTimer = null
        if (collabSyncStatus.value === 'syncing') {
          collabSyncStatus.value = 'connected'
        }
      }, 800)
    }
  })
  collabBinding = new QuillBinding(ytext, _editor, provider.awareness)
  // color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
  const localUser = {
    name: `user${Math.random().toString(36).slice(2, 8)}`,
  }
  currentCollabUser.value = localUser
  provider.awareness.setLocalStateField('user', localUser)
  provider.awareness.setLocalStateField('ts', Date.now())
  // 心跳：定期刷新时间戳，协作者据此判断彼此是否在线（直接关浏览器时服务端可能检测不到断连）
  collabHeartbeatTimer = setInterval(() => {
    provider.awareness.setLocalStateField('ts', Date.now())
  }, 5000)
  // 同步当前房间的协作用户列表（awareness 变化时实时更新）
  const awareness = provider.awareness
  const updateCollabUsers = () => {
    const users: { name: string, color?: string }[] = []
    const now = Date.now()
    for (const state of awareness.getStates().values()) {
      const s = state as { user?: { name: string, color?: string }, ts?: number }
      // 超过 15 秒未刷新心跳视为已退出，直接从列表移除
      if (!s.user || (s.ts !== undefined && now - s.ts > 15000)) {
        continue
      }
      users.push({ name: s.user.name, color: s.user.color })
    }
    collabUsers.value = users
  }
  collabAwareness = awareness
  collabAwarenessHandler = updateCollabUsers
  awareness.on('change', updateCollabUsers)
  updateCollabUsers()
  // 房间为空（无协作者、本地也无缓存）时，用 mock 内容作为初始文档。
  // 离线场景 websocket 不会触发 sync，因此同时监听本地缓存同步并做兜底
  const maybeSeed = () => {
    if (epoch !== editorEpoch) {
      return
    }
    if (ytext.length === 0 && content) {
      isSeedingContent = true
      _editor?.clipboard.dangerouslyPasteHTML(content)
      isSeedingContent = false
    }
  }
  provider.on('sync', (isSynced: boolean) => {
    if (isSynced) {
      maybeSeed()
      if (collabSyncStatus.value === 'syncing') {
        collabSyncStatus.value = 'connected'
      }
    }
  })
  persistence.on('synced', maybeSeed)
  setTimeout(maybeSeed, 1500)
  if (route.query.id === undefined) {
    _editor.focus()
  }
}

function syncForm() {
  const id = route.query.id === undefined ? undefined : Number(route.query.id)
  if (id === loadedDocId) {
    return
  }
  loadedDocId = id
  pendingDocId.value = null
  title.value = activeDocument.value?.name ?? ''
  initEditor(activeDocument.value?.content ?? '')
  if (id === undefined) {
    _editor?.focus()
  }
}

onMounted(() => {
  syncForm()
  window.addEventListener('keydown', handleKeydown)
})

watch(() => route.query.id, syncForm, { flush: 'post' })

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  if (syncBackTimer) {
    clearTimeout(syncBackTimer)
  }
  destroyEditor()
})

function goBack() {
  // 有内容但没有标题时自动保存不会生效，返回会丢失内容，先提示用户
  const hasContent = !!(_editor?.getText().trim())
  if (hasContent && !title.value.trim() && pendingDocId.value == null) {
    Modal.confirm({
      title: '提示',
      message: '文档尚未保存：已填写内容但缺少标题，返回后内容将丢失。确定要返回吗？',
    }).then((res: string) => {
      if (res === 'confirm') {
        pushBack()
      }
    })
    return
  }
  // 有标题时先把未触发的自动保存落盘，再返回
  if (title.value.trim()) {
    doSave()
  }
  pushBack()
}

function pushBack() {
  // 从多人协同进入的返回多人协同列表，否则返回开始创作列表
  router.push({
    name: 'Editor',
    query: isCollaborationMode.value ? { view: 'collaboration' } : {},
  })
}

function handleSelectDoc(id: number) {
  router.replace({
    name: 'EditorCreate',
    query: isCollaborationMode.value ? { id, from: 'collaboration' } : { id },
  })
}

const createMenuOptions = reactive({
  options: [
    { label: '创建文档', type: 'create', icon: iconEdit() },
    { label: '多人协同', type: 'collaboration', icon: iconGroup() },
  ],
  textField: 'label',
  // 弹层挂载到 body，样式需配合下方全局 style 块
  popperClass: 'editor-create-dropdown-menu',
})

function handleCreateMenuClick({ itemData }: any) {
  // 已处于新建模式时 query 不变不会触发 watch，这里强制重置编辑器
  loadedDocId = null
  collabRoomSeed = ''
  router.replace({
    name: 'EditorCreate',
    query: itemData?.type === 'collaboration' ? { from: 'collaboration' } : {},
  }).then(() => syncForm())
}

// 自动保存：标题或正文变化后延迟保存，无需手动点击保存按钮
let saveTimer: ReturnType<typeof setTimeout> | null = null
let syncBackTimer: ReturnType<typeof setTimeout> | null = null

function scheduleAutoSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    saveTimer = null
    doSave()
  }, 800)
}

watch(title, () => scheduleAutoSave())

function doSave(): boolean {
  const name = title.value.trim()
  if (!name) {
    return false
  }
  const content = _editor?.getSemanticHTML() ?? editorRef.value?.innerHTML ?? ''
  // 协同模式保存时把当前用户并入文档成员（仅当真实编辑过内容），列表“成员”列可见
  const mergeMembers = (members: string[]) => {
    const userName = currentCollabUser.value?.name
    if (!userName || !hasUserContentEdit) {
      return members
    }
    return [...new Set([...members, userName])]
  }
  const pendingId = pendingDocId.value
  const id = route.query.id !== undefined ? Number(route.query.id) : pendingId
  if (id == null) {
    // 新建模式首次保存：只写入数据，不改 URL，防止布局重挂载页面
    let doc
    if (isCollaborationMode.value) {
      doc = addCollaborationDocument({ name, content })
      updateCollaborationDocument(doc.id, { members: mergeMembers(doc.members) })
    }
    else {
      doc = addDocument({ name, content, department: '未分类' })
    }
    pendingDocId.value = doc.id
    loadedDocId = doc.id
    return true
  }
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
  if (isCollaborationMode.value) {
    const doc = collaborationDocuments.find(item => item.id === id)
    updateCollaborationDocument(id, { name, content, time: now, members: mergeMembers(doc?.members ?? []) })
  }
  else {
    updateDocument(id, { name, content, time: now })
  }
  return true
}

function resetPage() {
  loadedDocId = null
  collabRoomSeed = ''
  router.replace({
    name: 'EditorCreate',
    query: isCollaborationMode.value ? { from: 'collaboration' } : {},
  }).then(() => syncForm())
}

function handleDelete() {
  const pendingId = pendingDocId.value
  if (isCreateMode.value && pendingId == null) {
    Modal.confirm({
      title: '提示',
      message: '当前文档尚未保存，确定清空并新建文档吗？',
    }).then((res: string) => {
      if (res === 'confirm') {
        resetPage()
      }
    })
    return
  }
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除文档「${title.value || '未命名文档'}」吗？删除后不可恢复。`,
  }).then((res: string) => {
    if (res !== 'confirm') {
      return
    }
    const id = isCreateMode.value ? pendingId! : Number(route.query.id)
    if (isCollaborationMode.value) {
      removeCollaborationDocument(id)
    }
    else {
      removeDocument(id)
    }
    Modal.message({ message: '删除成功', status: 'success' })
    resetPage()
  })
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    const saved = doSave()
    Modal.message({
      message: saved ? '文档已自动保存，无需手动保存' : '请输入文档标题',
      status: saved ? 'success' : 'warning',
    })
    return
  }
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}
</script>

<template>
  <div class="editor-create-page">
    <Breadcrumb :items="isCollaborationMode ? ['menu.form', 'menu.form.editor', 'menu.form.editor.collaboration'] : ['menu.form', 'menu.form.editor', 'menu.form.editor.create']" />
    <div class="editor-create" :class="{ 'editor-create--fullscreen': isFullscreen }">
      <div class="editor-create-list">
        <div class="editor-create-back" @click="goBack">
          <span class="editor-create-back-icon"><IconChevronLeft /></span>
          <span class="editor-create-back-text">返回</span>
        </div>
        <div class="editor-create-new">
          <TinyDropdown
            class="editor-create-new-dropdown"
            inherit-width border
            :menu-options="createMenuOptions"
            @item-click="handleCreateMenuClick"
          >
            <span class="editor-create-trigger-label">
              <span class="editor-create-trigger-icon"><IconAdd /></span>
              新建文档
            </span>
          </TinyDropdown>
        </div>
        <div class="editor-create-list-body">
          <div class="editor-create-list-title">
            文档列表
          </div>
          <div
            v-for="doc in docList"
            :key="doc.id"
            class="editor-create-item"
            :class="{ 'editor-create-item--active': doc.id === activeDocument?.id }"
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
            <div v-if="isFullscreen" class="editor-create-fullback" @click="goBack">
              <span class="editor-create-back-icon"><IconChevronLeft /></span>
              <span class="editor-create-fullback-text">返回</span>
              <span class="editor-create-fullback-divider">|</span>
            </div>
            <div class="editor-create-content-field">
              <TinyInput v-model="title" placeholder="请输入文档标题" class="editor-create-content-input" />
            </div>
          </div>
          <div class="editor-create-actions">
            <span class="editor-create-action editor-create-action--danger" title="删除" @click="handleDelete">
              <IconDel />
            </span>
            <span class="editor-create-action" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
              <component :is="isFullscreen ? iconMinscreenRight() : iconFullscreenRight()" />
            </span>
          </div>
        </div>
        <div class="editor-create-editor-scroll">
          <div v-if="isCollaborationMode" class="editor-create-statusbar">
            <span class="editor-create-sync">
              <component :is="IconSync" />
              <span class="editor-create-sync-text">{{ syncStatusText }}</span>
            </span>
            <span class="editor-create-collabusers">
              <span
                v-for="user in visibleUsers"
                :key="user.name"
                class="editor-create-collabuser"
                :style="{ color: user.color }"
              >
                <IconUser />
                <span class="editor-create-collabuser-name">{{ user.name }}</span>
              </span>
              <TinyDropdown
                v-if="moreUsers.length"
                class="editor-create-more"
                :suffix-icon="IconEllipsis"
                trigger="hover"
                :menu-options="{ options: moreUsers, textField: 'label', popperClass: 'editor-create-dropdown-menu' }"
              >
                <span class="editor-create-more-trigger" /></TinyDropdown>
              <span v-if="!collabUsers.length" class="editor-create-collabusers-empty">连接中…</span>
            </span>
          </div>
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

// 全屏：不遮挡左侧主菜单与面包屑，仅隐藏文档目录列表，编辑器占用其空间
.editor-create--fullscreen {
  .editor-create-list {
    display: none;
  }
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
  padding: 32px;
  border-right: 1px solid #e8e8e8;
}

.editor-create-list-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid #f0f0f0;
}

.editor-create-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #191919;
  line-height: 24px;
  margin: 20px 0;
}

.editor-create-back {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 8px;
  margin-bottom: 20px;
  cursor: pointer;
  color: #1476ff;

  &:hover {
    color: #0b5ed7;
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

.editor-create-new-dropdown {
  width: 100%;

  :deep(.tiny-dropdown__border) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    padding: 12px 20px;
    font-weight: 700;
    color: #fff;
    background: #1476ff;
    border-color: #1476ff;

    &:hover,
    &:focus {
      color: #fff;
      background: #0e63d8;
      border-color: #0e63d8;

      svg {
        fill: #fff;
      }
    }

    // 覆盖主题 hover 下图标变色规则
    &:hover.tiny-button.tiny-button--default:not(.is-disabled) .tiny-svg {
      fill: #fff;
    }

    svg {
      fill: #fff;
    }
  }
}

.editor-create-trigger-label {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
}

.editor-create-trigger-icon {
  display: inline-flex;
  font-size: 16px;
  margin-right: 16px;
}

.editor-create-fullback {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  margin-right: 8px;
  cursor: pointer;
  color: #1476ff;

  &:hover {
    color: #0b5ed7;
  }
}

.editor-create-fullback-text {
  font-size: 14px;
  line-height: 22px;
}

.editor-create-fullback-divider {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #d9d9d9;
}

.editor-create-item {
  height: 76px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  background: #ffffff;
  border-radius: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f5f5f5;
  }
}

.editor-create-item--active {
  background: #f5f5f5;
}

.editor-create-item-name {
  font-size: 14px;
  font-weight: 550;
  line-height: 20px;
  color: #595959;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.editor-create-item-time {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  color: #808080;
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
  flex: 1;
  min-width: 0;
}

.editor-create-content-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-create-content-input {
  width: 360px;
  min-width: 0;
  flex-shrink: 1;

  // 无边框输入框，聚焦时显示
  :deep(.tiny-input__inner) {
    font-size: 18px;

    &,
    &:hover {
      border-color: transparent;
    }

    &::placeholder {
      font-size: 18px;
    }

    &:focus {
      border-color: #191919;
    }
  }
}

// 编辑器内顶部状态栏：位于工具栏下方，宽度随编辑器，左侧同步状态，右侧协同用户
// ::before 在状态栏行补画编辑框左右边框，保证工具栏-状态栏-编辑区的外框连续
.editor-create-statusbar {
  position: relative;
  order: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  margin: 24px 16px 0px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 8px;
  color: #595959;
  background: #f5f5f5;

  &::before {
    position: absolute;
    top: -24px;
    bottom: 0;
    left: -16px;
    right: -16px;
    pointer-events: none;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    content: '';
  }
}

.editor-create-sync {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .editor-create-sync-text {
    color: #595959;
    font-size: 14px;
  }

  .tiny-svg {
    fill: currentcolor;
    font-size: 14px;
  }
}

.editor-create-collabusers {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.editor-create-collabuser {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .tiny-svg {
    fill: currentcolor;
    font-size: 14px;
  }
}

.editor-create-collabuser-name {
  font-weight: 500;
  font-size: 14px;
  color: #595959;
}

.editor-create-collabusers-empty {
  color: #999;
}

// 超过 3 个用户时的 ellipsis 更多入口
.editor-create-more {
  display: inline-flex;

  :deep(.tiny-dropdown__suffix-inner) {
    .tiny-svg {
      fill: #595959;
    }
  }

  .editor-create-more-trigger {
    display: inline-flex;
    align-items: center;
    color: #595959;
    cursor: pointer;

    .tiny-svg {
      fill: currentcolor;
    }
  }
}

.editor-create-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.editor-create-action {
  display: inline-flex;
  font-size: 18px;
  color: #666;
  cursor: pointer;

  .tiny-svg {
    fill: #191919;
  }
}

.editor-create-editor-scroll {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 32px;

  :deep(.ql-toolbar) {
    order: 1;
    flex-shrink: 0;
  }
}

// 编辑器撑满剩余空间，滚动只发生在 .ql-editor 内部
.editor-create-content-editor {
  order: 3;
  flex: 1;
  min-height: 0;
  height: auto;

  :deep(.ql-editor) {
    color: #000;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    li,
    blockquote {
      color: #000;
    }
  }
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

// 下拉弹层挂载到 body，需用非 scoped 样式
<style lang="less">
// 下拉菜单
.editor-create-dropdown-menu.tiny-dropdown-menu {
  padding: 8px;

  .tiny-dropdown-item {
    height: 40px;
    margin-bottom: 4px;
    padding: 0 12px;
    line-height: 40px;
    border-radius: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: #f5f5f5;
      border-radius: 16px;
    }

    .tiny-dropdown-item__wrap .tiny-dropdown-item__content .tiny-dropdown-item__label {
      margin-left: 2px;
    }
  }
}
</style>
