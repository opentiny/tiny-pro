local uid = ARGV[1]
local newSessionId = ARGV[2]
local sessionIssueAt = ARGV[3]
local oldSessionId = ARGV[4]
local newAccessTokenJti = ARGV[5]
local newRefreshTokenJti = ARGV[6]
local newAccessToken = ARGV[7]
local newRefreshToken = ARGV[8]
local accessTokenTTL = ARGV[9]
local refreshTokenTTL = ARGV[10]

if redis.call('exists', 'session:' .. oldSessionId) == 0 then
  return redis.error_reply('SESSION_NOT_FOUND')
end

local oldAccessTokenJti = redis.call('hget', 'session:' .. oldSessionId, 'accessTokenJti')
local oldRefreshTokenJti = redis.call('hget', 'session:' .. oldSessionId, 'refreshTokenJti')

if redis.call('exists', 'token:' .. oldRefreshTokenJti ) == 0 then
  return redis.error_reply('TOKEN_EXPIRED')
end

redis.call('zrem', 'user:' .. uid .. ':session', oldSessionId)
redis.call('del', 'token:' .. oldAccessTokenJti)
redis.call('del', 'token:' .. oldRefreshTokenJti)
redis.call('del', 'session:' .. oldSessionId)

redis.call('zadd', 'user:' .. uid .. ':session', sessionIssueAt, newSessionId)
redis.call('set', 'token:' .. newAccessTokenJti, newAccessToken, 'EX', accessTokenTTL)
redis.call('set', 'token:' .. newRefreshTokenJti, newRefreshToken, 'EX', refreshTokenTTL)
redis.call(
'hset', 'session:' .. newSessionId,
'uid', uid,
'accessTokenJti', newAccessTokenJti,
'refreshTokenJti', newRefreshTokenJti,
'issueAt', sessionIssueAt
)
