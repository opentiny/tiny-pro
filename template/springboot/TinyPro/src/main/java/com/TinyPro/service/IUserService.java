package com.TinyPro.service;

import com.TinyPro.entity.dto.CreateUserDto;
import com.TinyPro.entity.po.User;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IUserService extends IService<User> {
    ResponseEntity<String> create(CreateUserDto user);

    List<Integer> getRoleByUserId(User user);

    ResponseEntity<User> getUserInfo(String email);
}
