package com.TinyPro.service.imp;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.enums.ResponseCodeEnum;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.IUserService;
import com.TinyPro.utils.JwtUtil;
import com.TinyPro.utils.LocaleUntil;
import com.TinyPro.utils.Sha256Utils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.jsonwebtoken.Claims;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthServiceImpl implements IAuthService {
    @Autowired
    private IUserService userService;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public ResponseEntity<String> login(CreateAuthDto createAuthDto) throws Exception {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("email",createAuthDto.getEmail());
        User user = userService.getOne(wrapper);
        if (user==null){
            String message = messageSource.getMessage("exception.auth.userNotExists", null, LocaleUntil.getLocale());
            return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
        }
        if (Sha256Utils.encry(createAuthDto.getPassword(),user.getSalt())!=user.getPassword()){
            String message = messageSource.getMessage("exception.auth.passwordOrEmailError", null, LocaleUntil.getLocale());
             return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
        }
        String jwt = jwtUtil.generateJwt(user.getEmail(), Contants.H_2);
        String key=Contants.UserJwtTop+user.getEmail()+Contants.UserJwtbt;
        redisUtil.setValue(key,jwt,Contants.H_2);
        return new ResponseEntity<>(jwt,HttpStatus.OK);
    }

    @Override
    public ResponseEntity<String> logout(String token){
        try {
            Claims claims = jwtUtil.parseJwt(token);
            String email = (String) claims.get("email");
            if (StringUtils.isAllEmpty(email)) {
                return new ResponseEntity<>("Fila", HttpStatus.NOT_FOUND);
            }
            redisUtil.deleteValue(email);
            return new ResponseEntity<>("success", HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
