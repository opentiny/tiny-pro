import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 富文本栏目（开始创作 / 多人协同）文档接口的 mock 数据。
 * 与前端 tinyvue mock（template/tinyvue/src/mock/editor.ts）保持一致的字段结构，
 * 响应为裸业务数据（无统一信封）。数据保存在内存中，重启后还原。
 */

interface RichTextDocument {
  id: number;
  name: string;
  department: string;
  time: string;
  content: string;
}

interface CollaborationDocument {
  id: number;
  name: string;
  members: string[];
  time: string;
  content: string;
}

function now() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const documents: RichTextDocument[] = [
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
    `,
  },
];

const collaborationDocuments: CollaborationDocument[] = [
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
];

function nextId(list: { id: number }[]) {
  return Math.max(0, ...list.map((item) => item.id)) + 1;
}

export default [
  {
    url: '/api/editor/documents',
    method: 'get',
    response: () => [...documents],
  },
  {
    url: '/api/editor/document',
    method: 'post',
    response: (params: { body: any }) => {
      const { name, department, content } = params.body ?? {};
      if (!name) {
        throw new HttpException('文档标题不能为空', HttpStatus.BAD_REQUEST);
      }
      const doc: RichTextDocument = {
        id: nextId(documents),
        name,
        department: department ?? '',
        time: now(),
        content: content ?? '',
      };
      documents.unshift(doc);
      return doc;
    },
  },
  {
    url: '/api/editor/document/update',
    method: 'post',
    response: (params: { body: any }) => {
      const { id, patch } = params.body ?? {};
      const index = documents.findIndex((item) => item.id === Number(id));
      if (index === -1) {
        return false;
      }
      documents[index] = { ...documents[index], ...patch };
      return true;
    },
  },
  {
    url: '/api/editor/document',
    method: 'delete',
    response: (params: { query: any }) => {
      const index = documents.findIndex(
        (item) => item.id === Number(params.query?.id)
      );
      if (index > -1) {
        documents.splice(index, 1);
      }
      return true;
    },
  },
  {
    url: '/api/editor/collaboration-documents',
    method: 'get',
    response: () => [...collaborationDocuments],
  },
  {
    url: '/api/editor/collaboration-document',
    method: 'post',
    response: (params: { body: any }) => {
      const { name, members, content } = params.body ?? {};
      if (!name) {
        throw new HttpException('文档标题不能为空', HttpStatus.BAD_REQUEST);
      }
      const doc: CollaborationDocument = {
        id: nextId(collaborationDocuments),
        name,
        members: members ?? [],
        time: now(),
        content: content ?? '',
      };
      collaborationDocuments.unshift(doc);
      return doc;
    },
  },
  {
    url: '/api/editor/collaboration-document/update',
    method: 'post',
    response: (params: { body: any }) => {
      const { id, patch } = params.body ?? {};
      const index = collaborationDocuments.findIndex(
        (item) => item.id === Number(id)
      );
      if (index === -1) {
        return false;
      }
      collaborationDocuments[index] = {
        ...collaborationDocuments[index],
        ...patch,
      };
      return true;
    },
  },
  {
    url: '/api/editor/collaboration-document',
    method: 'delete',
    response: (params: { query: any }) => {
      const index = collaborationDocuments.findIndex(
        (item) => item.id === Number(params.query?.id)
      );
      if (index > -1) {
        collaborationDocuments.splice(index, 1);
      }
      return true;
    },
  },
] as const;
