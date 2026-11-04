import { reactive } from 'vue'

export interface RichTextDocument {
  id: number
  name: string
  department: string
  time: string
  content: string
}

export const richTextDocuments = reactive<RichTextDocument[]>([
  {
    id: 1,
    name: 'TinyPro 项目周报',
    department: '前端开发部',
    time: '2026-10-20 10:30:00',
    content: `
      <h2><strong>TinyPro 项目周报</strong></h2>
      <p>本周主要完成了 <strong>TinyPro</strong> 中后台模板的基础功能开发，整体进度符合预期。</p>
      <h3>一、本周完成</h3>
      <ul>
        <li>完成表单页基础表单、分步表单的开发与联调</li>
        <li>接入 FluentEditor 富文本编辑器，支持表格、表情等扩展能力</li>
        <li>修复登录页在移动端下的样式适配问题</li>
      </ul>
      <h3>二、下周计划</h3>
      <ol>
        <li>推进富文本栏目（开始创作 / 多人协同）页面开发</li>
        <li>完成列表页卡片模式的联调与验收</li>
      </ol>
      <blockquote>风险：多人协同编辑依赖后端 WebSocket 服务，需要提前申请测试环境。</blockquote>
    `,
  },
  {
    id: 2,
    name: '版本发布说明 V2.3.0',
    department: '产品研发部',
    time: '2026-10-18 16:45:00',
    content: `
      <h2><strong>V2.3.0 发布说明</strong></h2>
      <p>本次版本聚焦于<strong>编辑器能力</strong>与<strong>性能优化</strong>，建议全量升级。</p>
      <h3>新增特性</h3>
      <ul>
        <li>富文本编辑器支持<u>多人实时协同编辑</u></li>
        <li>新增文档列表视图，支持按部门、时间筛选</li>
      </ul>
      <h3>问题修复</h3>
      <ul>
        <li>修复表格在暗色主题下边框颜色异常的问题</li>
        <li>修复部分场景下工具栏图标不显示的缺陷</li>
      </ul>
      <p><em>升级方式：执行 <code>pnpm update</code> 并重新构建即可。</em></p>
    `,
  },
  {
    id: 3,
    name: '需求评审纪要',
    department: '产品部',
    time: '2026-10-15 09:20:00',
    content: `
      <h2><strong>需求评审纪要</strong></h2>
      <p>参会人：产品、设计、前端、后端、测试（全员到齐）。</p>
      <h3>评审结论</h3>
      <ol>
        <li>表单页新增<strong>富文本栏目</strong>，与基础表单、分步表单同级</li>
        <li>富文本栏目包含内容创作、多人协同两个子功能</li>
        <li>文档列表默认隐藏表头，展示文档标题与编辑、删除操作</li>
      </ol>
      <h3>待确认事项</h3>
      <ul>
        <li>协同编辑后端服务的部署方案（Docker / 本地部署）</li>
      </ul>
      <blockquote>下次评审时间：下周一 10:00。</blockquote>
    `,
  },
])

export function addDocument(data: Omit<RichTextDocument, 'id' | 'time'>, time?: string): RichTextDocument {
  const id = Math.max(0, ...richTextDocuments.map(doc => doc.id)) + 1
  const doc: RichTextDocument = {
    ...data,
    id,
    time: time ?? new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
  }
  richTextDocuments.unshift(doc)
  return doc
}

export function updateDocument(id: number, patch: Partial<Omit<RichTextDocument, 'id'>>): boolean {
  const index = richTextDocuments.findIndex(doc => doc.id === id)
  if (index === -1)
    return false
  richTextDocuments[index] = { ...richTextDocuments[index], ...patch }
  return true
}

export function removeDocument(id: number): boolean {
  const index = richTextDocuments.findIndex(doc => doc.id === id)
  if (index === -1)
    return false
  richTextDocuments.splice(index, 1)
  return true
}

export interface CollaborationDocument {
  id: number
  name: string
  members: string[]
  time: string
  content: string
}

export const collaborationDocuments = reactive<CollaborationDocument[]>([
  {
    id: 101,
    name: 'TinyPro 迭代计划协同文档',
    members: ['张伟', '李娜'],
    time: '2026-10-21 10:00:00',
    content: `
      <h2><strong>TinyPro 迭代计划</strong></h2>
      <p>本迭代聚焦富文本栏目与列表页联调，各模块负责人请每日更新进展。</p>
      <ul>
        <li>表单页：基础表单、分步表单已完成</li>
        <li>富文本：开始创作、多人协同编辑开发中</li>
        <li>列表页：卡片模式待验收</li>
      </ul>
    `,
  },
  {
    id: 102,
    name: '富文本编辑器需求协同文档',
    members: ['刘洋', '赵敏'],
    time: '2026-10-20 15:30:00',
    content: `
      <h2><strong>富文本编辑器需求</strong></h2>
      <ol>
        <li>支持表格、表情、代码块等扩展能力</li>
        <li>支持多人实时协同编辑与光标显示</li>
        <li>支持文档列表管理与历史版本回溯</li>
      </ol>
    `,
  },
  {
    id: 103,
    name: '团队周会纪要协同文档',
    members: ['褚峰', '卫东'],
    time: '2026-10-16 10:00:00',
    content: `
      <h2><strong>团队周会纪要</strong></h2>
      <ul>
        <li>上周完成：登录 mock 联调、构建流水线修复</li>
        <li>本周计划：富文本栏目收尾、E2E 用例补充</li>
      </ul>
    `,
  },
])

export function updateCollaborationDocument(id: number, patch: Partial<Omit<CollaborationDocument, 'id'>>): boolean {
  const index = collaborationDocuments.findIndex(doc => doc.id === id)
  if (index === -1)
    return false
  collaborationDocuments[index] = { ...collaborationDocuments[index], ...patch }
  return true
}

export async function removeCollaborationDocument(id: number): Promise<boolean> {
  const index = collaborationDocuments.findIndex(doc => doc.id === id)
  if (index === -1)
    return false
  // 先清理本地 IndexedDB 中的房间数据，清理失败不移除记录，避免同 id 重建文档时复活旧内容
  if (!await clearCollabRoomData(id)) {
    return false
  }
  // 清理期间列表可能已被其他删除操作改变，移除前重新按 id 查找，避免删错文档
  const currentIndex = collaborationDocuments.findIndex(doc => doc.id === id)
  if (currentIndex !== -1)
    collaborationDocuments.splice(currentIndex, 1)
  return true
}

// 清理本地 IndexedDB 中的协同房间数据；返回是否清理成功
async function clearCollabRoomData(id: number): Promise<boolean> {
  try {
    const { clearDocument } = await import('y-indexeddb')
    // 其他页面或标签页仍打开该房间连接时 deleteDatabase 会被阻塞，超时按失败处理
    await Promise.race([
      clearDocument(`tiny-pro-collab-${id}`),
      new Promise((_resolve, reject) => setTimeout(() => reject(new Error('clear collab room data timeout')), 3000)),
    ])
    return true
  }
  catch (error) {
    console.error('清理协同文档本地缓存失败', error)
    return false
  }
}

// 等待未完成的房间数据删除落定：主动发起一次 deleteDatabase，
// onsuccess 表示数据库已删除（此前的 pending 删除已落定）；onblocked 表示仍有连接持有该房间，
// 轮询直至删除完成或超时。用于删除失败后恢复编辑器前，避免新连接排在 pending 删除之后、
// 房间数据在编辑器使用过程中被清掉
export function waitCollabRoomDataSettled(room: string, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now()
    const attempt = () => {
      const request = indexedDB.deleteDatabase(room)
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => {
        if (Date.now() - start > timeoutMs) {
          resolve()
          return
        }
        setTimeout(attempt, 300)
      }
    }
    attempt()
  })
}

// 协同文档 id 分配自持久化计数器（localStorage）：删除文档（包括最大 id）或刷新页面后都不会复用旧 id，
// 避免新文档与远端仍存活的同名协同房间（tiny-pro-collab-${id}）串内容
const COLLAB_DOC_ID_KEY = 'tiny-pro-collab-doc-id'

// 9 位随机量：localStorage 读-改-写无法跨标签页串行化，并发新建可能读到同一计数，
// 在单调下限之上叠加随机量把碰撞概率降到可忽略（非安全场景，crypto 不可用时退化 Math.random）
function randomIdSuffix(): number {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000_000
  }
  return Math.floor(Math.random() * 1_000_000_000)
}

function nextCollaborationDocumentId(): number {
  const maxId = Math.max(100, ...collaborationDocuments.map(doc => doc.id))
  try {
    const stored = Number(localStorage.getItem(COLLAB_DOC_ID_KEY))
    const floor = Math.max(Number.isInteger(stored) ? stored : 100, maxId) + 1
    const next = Math.max(floor, 1_000_000_000) + randomIdSuffix()
    localStorage.setItem(COLLAB_DOC_ID_KEY, String(next))
    return next
  }
  catch {
    // localStorage 不可用（如隐私模式）时退化为时间戳，同样保证 id 不复用
    return Math.max(maxId + 1, Date.now())
  }
}

export function addCollaborationDocument(data: Pick<CollaborationDocument, 'name' | 'content'>): CollaborationDocument {
  const id = nextCollaborationDocumentId()
  const doc: CollaborationDocument = {
    ...data,
    id,
    members: ['我'],
    time: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
  }
  collaborationDocuments.unshift(doc)
  return doc
}
