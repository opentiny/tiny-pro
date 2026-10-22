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
    time: '2024-05-20 10:30:00',
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
        <li>推进富文本栏目（内容创作 / 多人协同）页面开发</li>
        <li>完成列表页卡片模式的联调与验收</li>
      </ol>
      <blockquote>风险：多人协同编辑依赖后端 WebSocket 服务，需要提前申请测试环境。</blockquote>
    `,
  },
  {
    id: 2,
    name: '版本发布说明 V2.3.0',
    department: '产品研发部',
    time: '2024-05-18 16:45:00',
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
    time: '2024-05-15 09:20:00',
    content: `
      <h2><strong>需求评审纪要</strong></h2>
      <p>参会人：产品、设计、前端、后端、测试（全员到齐）。</p>
      <h3>评审结论</h3>
      <ol>
        <li>表单页新增<strong>富文本栏目</strong>，与基础表单、分步表单同级</li>
        <li>富文本栏目包含内容创作、多人协同两个子功能</li>
        <li>文档列表默认隐藏表头，展示文档名称、部门、时间三列</li>
      </ol>
      <h3>待确认事项</h3>
      <ul>
        <li>协同编辑后端服务的部署方案（Docker / 本地部署）</li>
      </ul>
      <blockquote>下次评审时间：下周一 10:00。</blockquote>
    `,
  },
  {
    id: 4,
    name: '技术方案设计文档',
    department: '架构组',
    time: '2024-05-12 14:00:00',
    content: `
      <h2><strong>富文本栏目技术方案</strong></h2>
      <p>整体采用<strong>前端 TinyEditor + Yjs + WebSocket</strong> 的协同编辑架构。</p>
      <h3>架构说明</h3>
      <ul>
        <li>编辑器：@opentiny/fluent-editor，基于 Quill 2.0 扩展</li>
        <li>协作引擎：Yjs 负责操作合并与冲突解决</li>
        <li>同步协议：y-websocket 连接后端同步服务</li>
        <li>本地持久化：y-indexeddb 保证刷新后内容不丢失</li>
      </ul>
      <p>光标显示基于 <code>quill-cursors</code>，每个协作者拥有独立的颜色与名称。</p>
    `,
  },
  {
    id: 5,
    name: '团队协作规范',
    department: '项目管理部',
    time: '2024-05-08 11:10:00',
    content: `
      <h2><strong>团队协作规范</strong></h2>
      <p>为提升协同编辑效率，请遵守以下规范：</p>
      <ul>
        <li>文档命名遵循「日期-主题-负责人」格式</li>
        <li>多人协同编辑前，先在文档列表中确认是否已有人在线</li>
        <li>重要结论使用<strong>加粗</strong>或引用块标记，方便回顾</li>
      </ul>
      <h3>附则</h3>
      <p>本规范自发布之日起生效，由项目管理部负责解释。</p>
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
