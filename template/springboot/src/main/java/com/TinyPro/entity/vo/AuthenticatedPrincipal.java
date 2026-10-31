package com.TinyPro.entity.vo;

/**
 * The authenticated identity resolved from a request token.
 */
public final class AuthenticatedPrincipal {

    public static final String REQUEST_ATTRIBUTE = AuthenticatedPrincipal.class.getName();

    public enum TokenType {
        API,
        ACCESS,
        LEGACY
    }

    private final String email;
    private final Integer userId;
    private final TokenType tokenType;

    public AuthenticatedPrincipal(String email, Integer userId, TokenType tokenType) {
        this.email = email;
        this.userId = userId;
        this.tokenType = tokenType;
    }

    public String getEmail() {
        return email;
    }

    public Integer getUserId() {
        return userId;
    }

    public TokenType getTokenType() {
        return tokenType;
    }
}
