const SCROLL_BLOCKING_EVENTS = new Set([
  'wheel',
  'mousewheel',
  'touchstart',
  'touchmove',
])

const nativeAddEventListener = EventTarget.prototype.addEventListener

function withPassive(
  type: string,
  options?: AddEventListenerOptions | boolean,
) {
  if (!SCROLL_BLOCKING_EVENTS.has(type))
    return options
  if (typeof options === 'object' && options && 'passive' in options)
    return options
  const capture = typeof options === 'boolean' ? options : Boolean(options?.capture)
  if (typeof options === 'object' && options)
    return { ...options, capture, passive: true }
  return { capture, passive: true }
}

EventTarget.prototype.addEventListener = function (type, listener, options) {
  return nativeAddEventListener.call(
    this,
    type,
    listener,
    withPassive(type, options),
  )
}
