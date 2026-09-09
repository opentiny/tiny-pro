export function resolvePlaywrightWebServerCommand(env = process.env) {
  const override = env.PLAYWRIGHT_WEB_SERVER_COMMAND?.trim()
  if (override) {
    return override
  }
  return env.CI ? 'pnpm dev:full' : 'pnpm start'
}
