<script setup lang="ts">
import type { BubbleMessage, BubbleRoleConfig, HistoryItem } from '@opentiny/tiny-robot'
import {
  TrBubbleList,
  TrHistory,
  TrSender,
  TrWelcome,
} from '@opentiny/tiny-robot'
import { IconAi, IconClose, IconHistory, IconNewSession, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h, ref, watch } from 'vue'
import { chatWithRobot } from '@/api/robot'
import '@opentiny/tiny-robot/dist/style.css'

interface ChatItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

interface Conversation extends HistoryItem {
  messages: ChatItem[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'tiny-robot-conversations'

const visible = ref(false)
const view = ref<'home' | 'chat'>('home')
const showHistory = ref(false)
const inputValue = ref('')
const requesting = ref(false)

// ---------- 会话数据（localStorage 持久化） ----------
const conversations = ref<Conversation[]>(loadConversations())
const activeConversationId = ref<string | null>(null)
let idSeed = Date.now()

const activeConversation = computed(
  () => conversations.value.find(c => c.id === activeConversationId.value) ?? null,
)
const activeMessages = computed(() => activeConversation.value?.messages ?? [])

// 历史记录按最近更新排序，供 TrHistory 使用
const historyList = computed<Conversation[]>(() =>
  [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt),
)

watch(
  conversations,
  (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  },
  { deep: true },
)

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Conversation[]) : []
  }
  catch {
    return []
  }
}

const welcomeIcon = h(IconAi, {
  style: { fontSize: '52px', color: 'var(--tr-color-primary, #2f5bea)' },
})

const roles = {
  assistant: {
    placement: 'start',
    avatar: h(IconAi, { style: { fontSize: '28px' } }),
  },
  user: {
    placement: 'end',
    avatar: h(IconUser, { style: { fontSize: '28px' } }),
  },
} satisfies Record<string, BubbleRoleConfig>

function createConversation() {
  const conversation: Conversation = {
    id: String(++idSeed),
    title: '新对话',
    messages: [
      {
        id: String(++idSeed),
        role: 'assistant',
        content: '你好，我是 TinyRobot 智能助手，有什么可以帮你的吗？',
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  conversations.value.unshift(conversation)
  showHistory.value = false
  openConversation(conversation.id)
}

function toggleHistory() {
  showHistory.value = !showHistory.value
}

function openConversation(id: string) {
  activeConversationId.value = id
  view.value = 'chat'
}

// ---------- TrHistory 事件 ----------
function onHistoryItemClick(item: HistoryItem) {
  openConversation(item.id!)
}

function onHistoryTitleChange(newTitle: string, item: HistoryItem) {
  const target = conversations.value.find(c => c.id === item.id)
  if (target) {
    target.title = newTitle
  }
}

function onHistoryItemAction(action: { id: string }, item: HistoryItem) {
  if (action.id === 'delete') {
    removeConversation(item.id!)
  }
}

function removeConversation(id: string) {
  const idx = conversations.value.findIndex(c => c.id === id)
  if (idx > -1) {
    conversations.value.splice(idx, 1)
  }
  if (activeConversationId.value === id) {
    activeConversationId.value = null
    view.value = 'home'
  }
}

// ---------- 面板开关 ----------
function togglePanel() {
  visible.value = !visible.value
  if (!visible.value) {
    view.value = 'home'
  }
}

function goHome() {
  view.value = 'home'
}

function buildHistory() {
  return activeMessages.value
    .filter(m => m.content && !m.loading)
    .map(({ role, content }) => ({ role, content }))
}

async function handleSubmit(value: string) {
  const question = value.trim()
  if (!question || requesting.value || !activeConversation.value) {
    return
  }

  activeConversation.value.messages.push({ id: String(++idSeed), role: 'user', content: question })
  // 第一条提问作为会话标题
  if (activeConversation.value.title === '新对话') {
    activeConversation.value.title = question.slice(0, 20)
  }
  activeConversation.value.updatedAt = Date.now()
  inputValue.value = ''

  const replyId = String(++idSeed)
  activeConversation.value.messages.push({
    id: replyId,
    role: 'assistant',
    content: '',
    loading: true,
  })
  requesting.value = true

  try {
    const reply = await chatWithRobot(buildHistory())
    updateMessage(replyId, { content: reply, loading: false })
  }
  catch (error: any) {
    updateMessage(replyId, {
      content: `请求失败：${error?.message || '请检查大模型配置后重试'}`,
      loading: false,
    })
  }
  finally {
    requesting.value = false
  }
}

function updateMessage(id: string, patch: Partial<ChatItem>) {
  const target = activeMessages.value.find(m => m.id === id)
  if (target) {
    Object.assign(target, patch)
  }
}
</script>

<template>
  <div class="tiny-robot">
    <button class="robot-entry" @click="togglePanel">
      <span v-if="visible" class="entry-icon"><IconClose /></span>
      <span v-else class="entry-icon">AI 助手</span>
    </button>

    <div v-if="visible" class="robot-panel">
      <template v-if="view === 'home'">
        <div class="home-toolbar">
          <span class="app-title">AI 智能助手</span>
          <div class="toolbar-actions">
            <button class="tool-btn" title="新增对话" @click="createConversation">
              <IconNewSession class="tool-icon" />
            </button>
            <button
              class="tool-btn"
              :class="{ 'is-disabled': !historyList.length }"
              :title="historyList.length ? '查看历史记录' : '暂无历史记录'"
              :disabled="!historyList.length"
              @click="toggleHistory"
            >
              <IconHistory class="tool-icon" />
            </button>
          </div>
        </div>

        <div class="home-body">
          <TrWelcome
            class="home-welcome"
            title="TinyRobot"
            description="您好，我是 TinyRobot，您专属的 AI 智能专家"
            :icon="welcomeIcon"
            align="center"
          >
            <template #footer>
              <div class="welcome-footer">
                点击右上角 ＋ 开始新的对话
              </div>
            </template>
          </TrWelcome>

          <div v-if="showHistory && historyList.length" class="history-section">
            <TrHistory
              :data="historyList"
              :selected="activeConversationId ?? undefined"
              :show-rename-controls="true"
              @item-click="onHistoryItemClick"
              @item-title-change="onHistoryTitleChange"
              @item-action="onHistoryItemAction"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="panel-header">
          <button class="back-btn" title="返回首页" @click="goHome">
            ‹
          </button>
          <span class="panel-title chat-title">{{ activeConversation?.title || '对话' }}</span>
        </div>

        <div class="panel-body">
          <TrBubbleList
            class="conversation-list"
            :messages="activeMessages as unknown as BubbleMessage[]"
            :role-configs="roles"
          />
        </div>

        <div class="panel-footer">
          <TrSender
            v-model="inputValue"
            placeholder="请输入你的问题，回车发送"
            clearable
            :disabled="requesting"
            @submit="handleSubmit"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.tiny-robot {
  position: fixed;
  right: 30px;
  bottom: 200px;
  z-index: 100;
}

.robot-entry {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  background: linear-gradient(135deg, #4a7bff 0%, #2f5bea 100%);
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgb(47 91 234 / 40%);
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &::before {
    position: absolute;
    inset: -4px;
    content: '';
    border: 2px solid rgb(47 91 234 / 50%);
    border-radius: 50%;
    opacity: 0;
    animation: pulse 2.4s ease-out infinite;
  }

  .entry-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    line-height: 1;

    svg {
      font-size: 18px;
    }
  }

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgb(47 91 234 / 55%);
  }

  // 打开状态下的外观
  &.is-open {
    background: #fff;
    border: 1px solid var(--tr-color-primary, #2f5bea);

    .entry-icon {
      color: var(--tr-color-primary, #2f5bea);
      font-size: 20px;
    }
  }

  // 悬浮提示文字
  .entry-tip {
    position: absolute;
    right: 60px;
    padding: 4px 10px;
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    background: rgb(0 0 0 / 75%);
    border-radius: 4px;
    opacity: 0;
    transform: translateX(4px);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &:hover .entry-tip {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.25);
    opacity: 0;
  }
  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}

.robot-panel {
  position: absolute;
  right: 0;
  bottom: 56px;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 480px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 15%);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);

  .panel-title {
    color: var(--tv-base-common-title-color, #333);
    font-weight: 700;
    font-size: 14px;
  }

  .chat-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.back-btn {
  padding: 0 6px;
  color: #666;
  font-size: 18px;
  line-height: 1;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #f2f4f8;
  }
}

.home-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.app-title {
  color: var(--tv-base-common-title-color, #333);
  font-weight: 700;
  font-size: 15px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 14px;
  color: #666;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  .tool-icon {
    font-size: 16px;
  }

  &:hover {
    background-color: #f2f4f8;
  }

  &.is-disabled {
    color: #c0c4cc;
    cursor: not-allowed;

    &:hover {
      background: none;
    }
  }
}

.home-body {
  flex: 1;
  padding: 24px 16px 16px;
  overflow-y: auto;
}

.home-welcome {
  margin-top: 48px;

  :deep(svg) {
    padding: 14px;
    background: var(--tr-color-primary-light, #eef3ff);
    border-radius: 50%;
    box-sizing: content-box;
  }
}

.welcome-footer {
  margin-top: 12px;
  color: #808080;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

.history-section {
  margin-top: 32px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.panel-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--color-border, #e4e7ed);
}

.conversation-list {
  --tr-bubble-list-gap: 12px;
  --tr-bubble-list-padding: 4px 4px 24px;
  --tr-bubble-max-width: 280px;
}
</style>
