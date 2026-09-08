local sessionId = ARGV[1]
local sessionIssueAt = ARGV[2]
local uid = ARGV[3]
local accessTokenJti = ARGV[4]
local accessToken = ARGV[5]
local refreshToken = ARGV[6]
local refreshTokenJti = ARGV[7]
local accessTokenTTL = tonumber(ARGV[8])
local refreshTokenTTL = tonumber(ARGV[9])

local sessionLimit = tonumber(ARGV[10])

local totalSession = redis.call('ZCARD', 'user:' .. uid .. ':session')
local removeCount = totalSession - sessionLimit + 1


-- 如果限制了数量且需要移除旧会话，则移除旧会话
if removeCount > 0 and sessionLimit ~= -1 then

  local removed = redis.call('zpopmin', 'user:' .. uid .. ':session', removeCount)

  for i = 1, #removed, 2 do
    local oldSessionId = removed[i]
    local accessTokenJti = redis.call('hget', 'session:' .. oldSessionId, 'accessTokenJti')
    local refreshTokenJti = redis.call('hget', 'session:' .. oldSessionId, 'refreshTokenJti')
    redis.call('del', 'token:' .. accessTokenJti)
    redis.call('del', 'token:' .. refreshTokenJti)
    redis.call('del', 'session:' .. oldSessionId)
  end
end

redis.call(
  'hset',
  'session:' .. sessionId,
  'uid', uid,
  'accessTokenJti', accessTokenJti,
  'refreshTokenJti', refreshTokenJti,
  'issueAt', sessionIssueAt
)

redis.call('set', 'token:' .. accessTokenJti, accessToken, 'EX', accessTokenTTL)
redis.call('set', 'token:' .. refreshTokenJti, refreshToken, 'EX', refreshTokenTTL)
redis.call('zadd', 'user:' .. uid .. ':session', sessionIssueAt, sessionId)
