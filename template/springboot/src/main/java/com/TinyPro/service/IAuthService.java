package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateApiTokenDto;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.RevokeApiTokenDto;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.vo.TokenPair;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.ResponseEntity;

public interface IAuthService {
    ResponseEntity<?> login(CreateAuthDto createAuthDto, HttpServletResponse response) throws Exception;

    String logout(@NotEmpty(message = "validation.NOT_EMPTY_HUMAN") String token);

    TokenPair refreshToken(@NotEmpty(message = "validation.NOT_EMPTY_HUMAN") String token);

    void revokeUserSessions(String email);

    ApiToken generateApiToken(CreateApiTokenDto dto);

    void revokeApiToken(RevokeApiTokenDto dto);
}
