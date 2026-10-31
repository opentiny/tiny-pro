package com.TinyPro.redis;

/**
 * Canonical Redis key formats used by the token subsystem.
 */
public final class TokenRedisKeys {

    private static final String USER_PREFIX = "user:";

    private TokenRedisKeys() {
    }

    public static String legacyToken(String email) {
        return USER_PREFIX + email + ":token";
    }

    public static String access(String uid, String jti) {
        return "at:" + uid + ":" + jti;
    }

    public static String refresh(String uid, String jti) {
        return "rt:" + uid + ":" + jti;
    }

    public static String session(String uid, String sessionId) {
        return "session:" + uid + ":" + sessionId;
    }

    public static String usedRefresh(String uid, String refreshJti) {
        return "used:rt:" + uid + ":" + refreshJti;
    }

    public static String refreshRotationResult(String uid, String refreshJti) {
        return usedRefresh(uid, refreshJti) + ":result";
    }

    public static String sessions(String uid) {
        return USER_PREFIX + uid + ":sessions";
    }

    public static String accessIndex(String uid) {
        return USER_PREFIX + uid + ":at";
    }

    public static String refreshIndex(String uid) {
        return USER_PREFIX + uid + ":rt";
    }

    public static String userLock(String uid) {
        return "user-token:" + uid;
    }

    public static String apiToken(String email, String tokenId) {
        return USER_PREFIX + email + ":api:" + tokenId;
    }

    public static String apiTokenIds(String email) {
        return USER_PREFIX + email + ":api:ids";
    }
}
