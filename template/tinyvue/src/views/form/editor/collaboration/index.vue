<script lang="ts" setup>
import type FluentEditor from '@opentiny/fluent-editor'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const editorRef = ref<HTMLElement>()
let _editor: FluentEditor | null = null

onMounted(() => {
  Promise.all([
    import('@opentiny/fluent-editor'),
    import('yjs'),
    import('y-protocols/awareness'),
    import('y-quill'),
    import('y-websocket'),
    import('y-indexeddb'),
    import('quill-cursors'),
  ]).then(
    ([
      { default: FluentEditor, CollaborationModule },
      Y,
      { Awareness },
      { QuillBinding },
      { WebsocketProvider },
      { IndexeddbPersistence },
      { default: QuillCursors },
    ]) => {
      FluentEditor.register('modules/collaborative-editing', CollaborationModule, true)

      _editor = new FluentEditor(editorRef.value, {
        theme: 'snow',
        modules: {
          'collaborative-editing': {
            deps: { Y, Awareness, QuillBinding, QuillCursors, WebsocketProvider, IndexeddbPersistence },
            provider: {
              type: 'websocket',
              options: {
                serverUrl: 'wss://demos.yjs.dev/ws',
                roomName: 'Tiny-Editor-Demo',
              },
            },
            awareness: {
              state: {
                name: `user${Math.random().toString(36).substring(2, 8)}`,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              },
              timeout: 30000,
            },
          },
        },
      })
    },
  ).catch((error) => {
    console.error('Failed to initialize FluentEditor:', error)
  })
})

onBeforeUnmount(() => {
  const container = editorRef.value
  if (container) {
    container.innerHTML = ''
  }
  _editor = null
})
</script>

<template>
  <div class="editor-collaboration">
    <div ref="editorRef" class="editor-collaboration-editor" />
    <div class="editor-desc">
      <a href="https://docs.opentiny.design/tiny-editor/demo/collaborative-editing.html" target="_blank" rel="noopener noreferrer">
        点击查看 → TinyEditor 官方文档
      </a>
    </div>
  </div>
</template>

<style scoped lang="less">
.editor-collaboration {
  padding: 32px 32px 24px;
}

.editor-collaboration-editor {
  width: 100%;
  min-height: 600px;
}

.editor-desc {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  font-size: 14px;
  color: #999;
  padding: 32px;

  a {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
