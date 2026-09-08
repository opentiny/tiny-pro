local uid = ARGV[1]
local sessionId = ARGV[2]
local sessionKey = 'session:' .. sessionId
local sessionSet = 'user:' .. uid .. ':session'

local accessTokenJti =
    redis.call(
      'hget',
      sessionKey,
      'accessTokenJti'
    )
local refreshTokenJti =
    redis.call(
      'hget',
      sessionKey,
      'refreshTokenJti'
    )

if redis.call('exists', sessionKey) == 0 then
  return redis.error_reply('SESSION_NOT_FOUND')
end

redis.call(
  'zrem',
  sessionSet,
  sessionId
)

if accessTokenJti then
  redis.call(
    'del',
    'token:' .. accessTokenJti
  )
end
if refreshTokenJti then
  redis.call(
    'del',
    'token:' .. refreshTokenJti
  )
end
redis.call(
  'del',
  sessionKey
)
if redis.call('zcard', sessionSet) == 0 then
  redis.call('del', sessionSet)
end
