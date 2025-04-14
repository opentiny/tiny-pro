# 贡献指南

## Fork 和克隆代码

* 打开 [TinyPro](https://github.com/opentiny/tiny-pro) 项目，点击右上角的“Fork”按钮，将仓库复制到你的 GitHub 账户下
* 使用以下命令将 Fork 后的仓库克隆到本地：`git clone https://github.com/[yourname]/tiny-pro.git`

## 安装依赖和本地启动

* 进入克隆后的仓库目录：`cd tiny-pro`

本地 TinyPro 目录如下：

```bash
- template
  - nestJs    # 后端服务
  - tinyvue   # 前端服务
```

### 启动后端

```bash
cd template/nestJs

pnpm i
```

将 `.env.example` 改成 `.env`，然后执行以下命令即可：

```bash
pnpm start
```

### 启动前端

启动前端和启动后端差不多。

```bash
cd template/tinyvue

pnpm i

pnpm start
```

访问链接：[http://localhost:3031/](http://localhost:3031/)，即可查看效果。

## 创建分支和提交代码

* 为你的修改创建一个新分支，避免直接在主分支上操作：`git checkout -b 你的分支名称`
* 在本地仓库中进行代码修改，确保遵循项目的代码风格和规范，避免格式化问题。
* 添加修改的文件到暂存区：`git add .`
* 提交修改，编写清晰的提交信息：`git commit -m "你的提交信息"`
* 将本地分支推送到你的 Fork 仓库：`git push origin 你的分支名称`

## 创建 Pull Request(PR)

* 在 GitHub 上，进入你的 Fork 仓库页面，点击"Compare & pull request"按钮，选择目标仓库的主分支 dev。
* 填写 PR 的标题和描述，说明你的修改内容和目的。
* 提交 PR，等待维护者审核。
* 如果维护者提了检视意见，需要及时修复和回复，并重新 commit && push

## 提交 Issue 和讨论

* 如果你发现项目中的问题，可以在 GitHub 上创建 [Issue](https://github.com/opentiny/tiny-pro/issues)，描述问题并提供复现步骤
* 如果你有解决方案，可以在 Issue 中提出建议，或直接通过 [PR](https://github.com/opentiny/tiny-pro/pulls) 修复问题
* 如果你有好的想法和点子，欢迎在 [Discussion](https://github.com/opentiny/tiny-pro/discussions) 中创建讨论

## 加入开源社区

如果你对我们的开源项目感兴趣，欢迎通过以下方式加入我们的开源社区。

- 添加官方小助手微信：opentiny-official（备注：TinyPro），加入我们的技术交流群
- 加入邮件列表：<opentiny@googlegroups.com>
