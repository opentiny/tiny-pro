import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePlaywrightWebServerCommand } from '../playwright-webserver.mjs'

test('local runs keep the mock frontend unless the command is overridden', () => {
  assert.equal(resolvePlaywrightWebServerCommand({}), 'pnpm start')
})

test('CI defaults to pnpm dev:full so Docker backend is actually exercised', () => {
  assert.equal(resolvePlaywrightWebServerCommand({ CI: 'true' }), 'pnpm dev:full')
})

test('PLAYWRIGHT_WEB_SERVER_COMMAND overrides both local and CI defaults', () => {
  assert.equal(
    resolvePlaywrightWebServerCommand({
      PLAYWRIGHT_WEB_SERVER_COMMAND: 'pnpm dev:full',
    }),
    'pnpm dev:full',
  )
  assert.equal(
    resolvePlaywrightWebServerCommand({
      CI: 'true',
      PLAYWRIGHT_WEB_SERVER_COMMAND: 'pnpm start',
    }),
    'pnpm start',
  )
})
