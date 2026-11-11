/**
 * 开发模式运行器：`nest build --watch` + `node --watch dist/main.js`。
 *
 * 替代 `nest start --watch`：后者在 Windows 下重建重启时，旧的应用进程
 * 可能尚未释放端口，新进程 listen 报 EADDRINUSE。node --watch 由 Node 直接
 * 管理应用进程，重启时能可靠地终止旧进程再拉起新进程，避免端口占用报错。
 *
 * 用法（由 package.json 的 start:mock / start:dev 脚本调用）：
 *   cross-env MOCK_MODE=true node scripts/dev-watch.mjs
 */
import { spawn } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 等待 nest build --watch 的首次编译完成：
// 观察 dist/main.js 的 mtime，连续一段时间（2s）不再变化即认为编译结束。
// 必须等首次编译完成再启动 node --watch，否则 watcher 初始编译重写产物
// 会触发一次"自发重启"，与刚启动的实例争抢端口。
async function waitForBuildOutput(entry, timeoutMs = 180000) {
  const start = Date.now()
  let lastMtime = 0
  let stableCount = 0
  while (Date.now() - start < timeoutMs) {
    await sleep(500)
    if (!existsSync(entry)) {
      continue
    }
    const mtime = statSync(entry).mtimeMs
    if (mtime === lastMtime) {
      stableCount += 1
      if (stableCount >= 4) {
        return
      }
    }
    else {
      stableCount = 0
      lastMtime = mtime
    }
  }
}

const build = spawn('nest', ['build', '--watch'], {
  stdio: 'inherit',
  shell: true,
})
await waitForBuildOutput('dist/main.js')

const server = spawn(process.execPath, ['--watch', 'dist/main.js'], {
  stdio: 'inherit',
  env: { ...process.env, TINY_PRO_DEV_WATCH: 'true' },
})

function shutdown() {
  build.kill()
  server.kill()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
build.on('exit', (code) => {
  server.kill()
  process.exit(code ?? 0)
})
server.on('exit', (code) => {
  build.kill()
  process.exit(code ?? 0)
})
