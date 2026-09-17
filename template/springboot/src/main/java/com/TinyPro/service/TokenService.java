package com.TinyPro.service;

import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.vo.TokenPair;
import io.jsonwebtoken.Claims;

public interface TokenService {

    TokenPair issue(User user);

    ApiToken issueApiToken(User user, String tokenName);

    boolean isApiTokenActive(String token, Claims claims);

    boolean validateApiToken(String email, String token);

    void revokeApiToken(String email, String tokenId);

    TokenPair rotate(String presentedRefreshToken);

    boolean isAccessTokenActive(String accessToken);

    void logout(String accessToken);

    void revokeUserSessions(String email);
}
