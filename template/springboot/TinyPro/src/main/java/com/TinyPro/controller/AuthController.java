package com.TinyPro.controller;

import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.service.IAuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private IAuthService authService;
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody  CreateAuthDto createAuthDto) throws Exception {
        return authService.login(createAuthDto);
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@Valid @RequestBody LogoutAuthDto logoutAuthDto){
        return authService.logout(logoutAuthDto.getToken());
    }
}
