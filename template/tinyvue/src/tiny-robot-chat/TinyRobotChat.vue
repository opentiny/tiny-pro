<script setup lang="ts">
import type { HistoryMenuItem, PromptProps, TemplateItem } from '@opentiny/tiny-robot'
import type { ChatHistoryItem, ChatRuntime } from '@opentiny/tiny-robot-chat'
import { TrSender, TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { TrChat, useChatHistoryItems, useChatRuntime } from '@opentiny/tiny-robot-chat'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import ComposerTools from './components/ComposerTools.vue'
import WindowHeader from './components/WindowHeader.vue'
import { useWindow } from './composables/useWindow'
import { mcpExamples, mcpServers, modelProviders } from './config/chat-runtime'
import { composerMenus, createChatUi, templateCategories } from './config/chat-ui'
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
import './index.css'

// 先声明后赋值，composer 相关 computed 回调延迟执行，此时 runtime 已完成初始化
let runtime!: ChatRuntime
// 回答生成中禁用输入区
const inputDisabled = computed(() => runtime.activeConversation.value?.requestState === 'processing')
runtime = useChatRuntime({ modelProviders, mcpServers, composer: { disabled: inputDisabled } })

const window = reactive(useWindow())
const chatRef = ref<{ send: (payload: { text: string }) => Promise<boolean> } | null>(null)
const currentTemplate = ref<TemplateItem[]>([])
const showHistory = ref(false)
const historyData = useChatHistoryItems({ conversations: () => runtime.conversations.value, defaultTitle: '' })
const activeConversationId = computed(() => runtime.activeConversation.value?.id)
const templateExtensions = [TrSender.template(currentTemplate as never, { appendTo: '.chat-add-window' })]
const chatUi = computed(() => createChatUi({ floatingOptions: window.floatingOptions, templateExtensions }))

// TinyRobot 1.0.0-rc.1 缺陷规避：输入区内置停止按钮的点击不会传导到 runtime 中止请求，
// 这里代理该按钮的点击，直接调用官方 abort API（actions.abort 已验证可正常中止）。
// 监听挂在 document 捕获阶段：聊天窗口是悬浮窗（Teleport 到 body），挂在组件容器上收不到其中的点击。
function handleStopClickCapture(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  const isCancel = target?.closest('.tr-sender-submit-button__cancel')
    || target?.closest('.tr-sender-submit-button.is-loading')
  if (isCancel) {
    event.stopPropagation()
    void runtime.actions.abort?.()
  }
}

onMounted(() => {
  document.addEventListener('click', handleStopClickCapture, true)
})
onUnmounted(() => {
  document.removeEventListener('click', handleStopClickCapture, true)
})

function handlePromptClick({ item }: { item: PromptProps }): void {
  if (item.description)
    void chatRef.value?.send({ text: item.description })
}

function handleNewSession(): void {
  void runtime.actions.createConversation()
  showHistory.value = false
}

function handleHistorySelect(item: ChatHistoryItem): void {
  void runtime.actions.switchConversation(item.raw.id)
  showHistory.value = false
}

function handleHistoryRename(title: string, item: ChatHistoryItem): void {
  void runtime.actions.renameConversation(item.raw.id, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatHistoryItem): void {
  if (action.id === 'delete')
    void runtime.actions.deleteConversation(item.raw.id)
}
</script>

<template>
  <TrTheme>
    <main class="chat-add-app">
      <button
        v-if="!window.show"
        class="chat-add-launcher"
        type="button"
        title="打开 TinyRobot"
        aria-label="打开 TinyRobot"
        @click="window.open"
      >
        <IconAi style="font-size: 32px" />
      </button>
      <TrChat
        v-if="window.show"
        ref="chatRef"
        v-model:floating-state="window.floatingState" class="chat-add-window"
        :class="[`chat-add-window--${window.displayMode}`]"
        :style="window.layoutStyle"
        :runtime="runtime"
        :ui="chatUi"
        @prompt-click="handlePromptClick"
      >
        <template #layout-header>
          <WindowHeader
            :display-mode="window.displayMode"
            :show-history="showHistory"
            :history-data="historyData"
            :active-conversation-id="activeConversationId"
            @new-session="handleNewSession"
            @select-history="handleHistorySelect"
            @rename-history="handleHistoryRename"
            @history-action="handleHistoryAction"
            @update:show-history="showHistory = $event"
            @change-mode="window.setDisplayMode"
            @close="window.close"
          />
        </template>
        <template #composer-before="{ submit }">
          <ComposerTools
            v-model:current-template="currentTemplate"
            :template-categories="templateCategories"
            :mcp-examples="mcpExamples"
            :menus="composerMenus"
            :submit="submit"
          />
        </template>
      </TrChat>
    </main>
  </TrTheme>
</template>
