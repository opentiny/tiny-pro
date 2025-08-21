package com.TinyPro.controller;

import com.TinyPro.annotation.PermissionAnnotation;
import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.*;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.UserVo;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.service.IUserService;
import com.TinyPro.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private IUserService userService;

    @PostMapping("/reg")
    @PermissionAnnotation("user::add")
    @Reject()
    public ResponseEntity<UserVo> register(@RequestBody CreateUserDto createUserDto) {
        boolean b = false;
        return userService.create(createUserDto,b);
    }

    @GetMapping({"/info", "/info/", "/info/{email}", "/info/{email}/"})
    public ResponseEntity<User> getUserInfo(HttpServletRequest request, @PathVariable(required = false) String email) {
        String authHeader = request.getHeader("Authorization");
        String token = extractToken(authHeader);
        Claims claims = jwtUtil.parseJwt(token);
        String JWTemail = claims.get("email", String.class);
        if (StringUtils.isEmpty(JWTemail)){
            throw new BusinessException("exception.common.unauth",HttpStatus.UNAUTHORIZED,null);
        }
//        判断email是否存在，如果不存在就取request里面的，如果存在就取email
        email = StringUtils.isNotEmpty(email) ? email :JWTemail;
        return userService.getUserInfo(email);
    }

    @Reject()
    @DeleteMapping("/{email}")
    @PermissionAnnotation("user::remove")
    public ResponseEntity<UserVo> delUser(@PathVariable String email) {
        return userService.removeUserInfo(email);
    }

    @Reject()
    @PatchMapping("/update")
    @PermissionAnnotation("user::update")
    public ResponseEntity<UserVo> UpdateUser(@RequestBody UpdateUserDto updateUserDto){
        return userService.updateUserInfo(updateUserDto);
    }

    @GetMapping
    @PermissionAnnotation("user::query") // 假设你有自定义的@Permission注解
    public ResponseEntity<PageWrapper<UserVo>> getAllUser(
            @ModelAttribute PaginationQueryDto paginationQuery,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer[] role,
            @RequestParam(required = false) String email) {

        // 调用服务层方法
        PageWrapper<UserVo> users = userService.getAllUser(paginationQuery, name, role, email);

        // 返回响应实体
        return ResponseEntity.ok(users);
    }
    @PatchMapping("/admin/updatePwd")
    @Reject()
    @PermissionAnnotation("user::password::force-update")
    public ResponseEntity<?> updatePwdAdmin(@RequestBody  @Valid UpdatePwdAdminDto dto) {
        return userService.updatePwdAdmin(dto);
    }
    @PatchMapping("/updatePwd")
    @Reject()
    @PermissionAnnotation("user::update") // 自定义权限注解
    public ResponseEntity<?> updatePwdUser(@RequestBody @Valid UpdatePwdUserDto dto) {
        userService.updatePwdUser(dto);
        return ResponseEntity.ok().build();
    }

    @Reject()
    @PostMapping("/batch")
    @PermissionAnnotation("user:batch-remove")
    public ResponseEntity<List<UserVo>> batchRemoveUser (@RequestBody List<String> emails) {
        return userService.batchDeleteUser(emails);
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}
