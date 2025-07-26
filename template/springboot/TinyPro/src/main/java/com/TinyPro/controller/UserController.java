package com.TinyPro.controller;

import com.TinyPro.annotation.Permission;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.CreateUserDto;
import com.TinyPro.entity.po.User;
import com.TinyPro.service.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private IUserService userService;

    @PostMapping("/reg")
    @Permission("user::add")
    @Reject()
    public ResponseEntity<String> register(@RequestBody CreateUserDto createUserDto) {
        return userService.create(createUserDto);
    }

    @GetMapping("/info/{email}")
    public ResponseEntity<User> getUserInfo(HttpServletRequest request, @PathVariable String email) {
        //TODO email
        return userService.getUserInfo(email);
    }

    @Reject()
    @DeleteMapping("/info/{email}")
    @Permission("user::remove")
    public ResponseEntity<String> delUser(@PathVariable String email) {
        //TODO email
        return userService.removeUserInfo(email);
    }
}
