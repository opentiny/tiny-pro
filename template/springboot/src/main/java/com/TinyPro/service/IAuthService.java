package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateAuthDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.function.ServerResponse;

import java.util.Map;

public interface IAuthService {
    ResponseEntity<?> login(CreateAuthDto createAuthDto, HttpServletResponse response) throws Exception;

    String logout(@NotEmpty(message = "validation.NOT_EMPTY_HUMAN") String token);
}
