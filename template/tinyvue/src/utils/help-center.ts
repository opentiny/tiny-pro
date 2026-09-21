export const HELP_CENTER_URL = 'https://opentiny.design/vue-pro/docs/start'

export function resolveHelpCenterUrl() {
  return HELP_CENTER_URL
}

export function openHelpCenter(
  open: typeof window.open = (...args) => window.open(...args),
) {
  return open(resolveHelpCenterUrl(), '_blank', 'noopener,noreferrer')
}
