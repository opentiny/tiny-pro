package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.dto.RevokeApiTokenDto;
import com.TinyPro.entity.vo.ApiToken;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.TokenService;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.utils.Sha256Utils;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements IAuthService {
    @Autowired
    private IUserRepository userService;
    @Autowired
    private TokenService tokenService;

    @Override
    public ResponseEntity<?> login(CreateAuthDto createAuthDto, HttpServletResponse response) throws Exception {
        Optional<User> optionalUser = userService.findByEmail(createAuthDto.getEmail());
        User user = optionalUser
                .orElseThrow(() ->  new BusinessException("exception.auth.userNotExists", HttpStatus.NOT_FOUND, null));
        if (!StringUtils.equals(Sha256Utils.encry(createAuthDto.getPassword(), user.getSalt()), user.getPassword())) {
            throw new BusinessException("exception.auth.passwordOrEmailError",HttpStatus.BAD_REQUEST,  null);
        }
        return new ResponseEntity<>(tokenService.issue(user), HttpStatus.OK);
    }

    @Override
    public String logout(String token) {
        tokenService.logout(token);
        return "redirect:/login";
    }

    @Override
    public com.TinyPro.entity.vo.TokenPair refreshToken(String token) {
        return tokenService.rotate(token);
    }

    @Override
    public void revokeUserSessions(String email) {
        tokenService.revokeUserSessions(email);
    }

    @Override
    public ApiToken generateApiToken(CreateApiTokenDto dto) {
        User user = userService.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("exception.auth.userNotExists", HttpStatus.NOT_FOUND, null));
        try {
            if (!StringUtils.equals(Sha256Utils.encry(dto.getPassword(), user.getSalt()), user.getPassword())) {
                throw new BusinessException("exception.auth.passwordOrEmailError", HttpStatus.BAD_REQUEST, null);
            }
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessException("exception.auth.passwordOrEmailError", HttpStatus.BAD_REQUEST, null);
        }
        return tokenService.issueApiToken(user, dto.getTokenName());
    }

    @Override
    public void revokeApiToken(RevokeApiTokenDto dto) {
        tokenService.revokeApiToken(dto.getEmail(), dto.getTokenId());
    }
}
