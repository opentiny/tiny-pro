package com.TinyPro.controller;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.LogoutAuthDto;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.service.IAuthService;
import com.TinyPro.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.ServerResponse;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private IAuthService authService;
    @Autowired
    private JwtUtil jwtUtil;

    @IsPublic()
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody CreateAuthDto createAuthDto, HttpServletResponse response) throws Exception {
        return authService.login(createAuthDto, response);
    }

    @PostMapping("/logout")
    public String logout(@Valid @RequestBody LogoutAuthDto logoutAuthDto) {
        Claims claims = jwtUtil.parseJwt(logoutAuthDto.getToken());
        String email = (String) claims.get("email");
        return authService.logout(email);
    }

    @GetMapping("/test")
    public ResponseEntity<MenuTreeVo> gettext() {
        return ResponseEntity.ok(new MenuTreeVo());
    }
}
