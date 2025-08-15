package com.TinyPro.service.imp;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.CreateAuthDto;
import com.TinyPro.entity.po.User;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IAuthService;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.utils.JwtUtil;
import com.TinyPro.utils.Sha256Utils;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthServiceImpl implements IAuthService {
    @Autowired
    private IUserRepository userService;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public ResponseEntity<?> login(CreateAuthDto createAuthDto, HttpServletResponse response) throws Exception {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("email", createAuthDto.getEmail());
        Optional<User> optionalUser = userService.findByEmail(createAuthDto.getEmail());
        User user = optionalUser
                .orElseThrow(() -> new BusinessException("exception.auth.userNotExists", HttpStatus.NOT_FOUND, null));
        if (!StringUtils.equals(Sha256Utils.encry(createAuthDto.getPassword(), user.getSalt()), user.getPassword())) {
            throw new BusinessException("exception.auth.passwordOrEmailError",HttpStatus.BAD_REQUEST,  null);
        }
        String jwt = jwtUtil.generateJwt(user.getEmail(), Contants.H_2);
        String key = Contants.UserJwtTop + user.getEmail() + Contants.UserJwtbt;
        redisUtil.setValue(key, JSON.toJSONString(user), Contants.H_2);
        Map<String, String> result = new HashMap<>();
        result.put("token", jwt);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @Override
    public String logout(String email) {
        try {
            if (StringUtils.isAllEmpty(email)) {
                throw new BusinessException("Fila", HttpStatus.NOT_FOUND,null);
            }
            redisUtil.deleteValue(email);
            return "redirect:/login";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
