package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateAuthDto;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.ResponseEntity;

public interface IAuthService {
    ResponseEntity<String> login(CreateAuthDto createAuthDto) throws Exception;

    ResponseEntity<String> logout(@NotEmpty(message = "validation.NOT_EMPTY_HUMAN") String token);
}
