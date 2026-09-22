package com.TinyPro.controller;

import com.TinyPro.annotation.IsPublic;
import com.TinyPro.entity.dto.*;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.vo.MenuTreeVo;
import com.TinyPro.entity.vo.TokenPair;
import com.TinyPro.service.IAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private IAuthService authService;

    @IsPublic()
    @PostMapping("/token/refresh")
    public ResponseEntity<TokenPair> refreshToken(@RequestBody @Valid RefreshTokenDto refreshTokenDto) {
        return ResponseEntity.ok(authService.refreshToken(refreshTokenDto.getToken()));
    }

    @IsPublic()
    @PostMapping("/api-token")
    @Operation(summary = "生成 API Token", description = "使用邮箱和密码生成供外部系统调用的 API Token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "生成成功"),
            @ApiResponse(responseCode = "400", description = "账号或密码错误"),
            @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    public ResponseEntity<ApiToken> generateApiToken(@RequestBody @Valid CreateApiTokenDto dto) {
        return ResponseEntity.ok(authService.generateApiToken(dto));
    }

    @IsPublic()
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid CreateAuthDto createAuthDto, HttpServletResponse response) throws Exception {
        return authService.login(createAuthDto, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Boolean>> logout(
            @Valid @RequestBody LogoutAuthDto logoutAuthDto,
            HttpServletRequest request
    ) {
        authService.logout(extractBearerToken(request));
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/revoke-api-token")
    @Operation(summary = "撤销 API Token", description = "按邮箱和 tokenId 撤销指定 API Token")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "撤销成功"),
            @ApiResponse(responseCode = "401", description = "未认证", content = @Content(schema = @Schema(hidden = true)))
    })
    public ResponseEntity<String> revokeApiToken(@RequestBody @Valid RevokeApiTokenDto dto) {
        authService.revokeApiToken(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/test")
    public ResponseEntity<MenuTreeVo> gettext() {
        return ResponseEntity.ok(new MenuTreeVo());
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        return header.substring(7);
    }
}
