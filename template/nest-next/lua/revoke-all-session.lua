-- revoke all sessions

local uid = ARGV[1]

local sessionSet = 'user:' .. uid .. ':session'

local sessionIds = redis.call(
  'zrange',
  sessionSet,
  0,
  -1
)

for _, sessionId in ipairs(sessionIds) do
  local sessionKey = 'session:' .. sessionId

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
end


redis.call(
  'del',
  sessionSet
)


return #sessionIds
