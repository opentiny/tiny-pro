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
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function terminateProcessTree(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => resolve();
    child.once('exit', done);

    if (process.platform === 'win32') {
      const killer = spawn(
        'taskkill',
        ['/pid', String(child.pid), '/T', '/F'],
        {
          stdio: 'ignore',
        }
      );
      killer.once('error', () => child.kill());
      return;
    }

    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill();
    }
  });
}

// 只接受本次 watch 编译新写入的产物，避免旧 dist/main.js 被误判为编译成功。
async function waitForBuildOutput(entry, initialMtime, timeoutMs = 180000) {
  const start = Date.now();
  let lastMtime = initialMtime;
  let hasNewOutput = false;
  let stableCount = 0;

  while (Date.now() - start < timeoutMs) {
    await sleep(500);
    if (!existsSync(entry)) {
      stableCount = 0;
      continue;
    }

    const mtime = statSync(entry).mtimeMs;
    if (!hasNewOutput) {
      if (mtime === initialMtime) {
        continue;
      }
      hasNewOutput = true;
      lastMtime = mtime;
      continue;
    }

    if (mtime === lastMtime) {
      stableCount += 1;
      if (stableCount >= 4) {
        return;
      }
    } else {
      stableCount = 0;
      lastMtime = mtime;
    }
  }

  throw new Error(`等待首次编译产物超时：${entry}`);
}

const entry = 'dist/main.js';
const initialMtime = existsSync(entry) ? statSync(entry).mtimeMs : 0;
const build = spawn('nest', ['build', '--watch'], {
  stdio: 'inherit',
  shell: true,
  detached: process.platform !== 'win32',
});
let server;
let shuttingDown = false;

async function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  await Promise.all([
    terminateProcessTree(build),
    terminateProcessTree(server),
  ]);
  process.exit(code);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

let rejectBuildFailure;
const buildFailure = new Promise((_, reject) => {
  rejectBuildFailure = reject;
});

function handleBuildFailure(code, signal) {
  const reason = signal ? `信号 ${signal}` : `退出码 ${code ?? 0}`;
  rejectBuildFailure(new Error(`构建进程已退出（${reason}）`));
  if (server) {
    void shutdown(code ?? 1);
  }
}

// 必须在等待产物前注册，首次编译立即失败时不能继续启动服务。
build.once('error', (error) => handleBuildFailure(1, error.message));
build.once('exit', handleBuildFailure);

try {
  await Promise.race([waitForBuildOutput(entry, initialMtime), buildFailure]);

  server = spawn(process.execPath, ['--watch', entry], {
    stdio: 'inherit',
    env: { ...process.env, TINY_PRO_DEV_WATCH: 'true' },
    detached: process.platform !== 'win32',
  });
  server.once('error', () => void shutdown(1));
  server.once('exit', (code) => void shutdown(code ?? 0));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  await terminateProcessTree(build);
  process.exitCode = 1;
}
