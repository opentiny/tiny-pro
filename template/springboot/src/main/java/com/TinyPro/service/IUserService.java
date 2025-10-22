package com.TinyPro.service;

import com.TinyPro.entity.dto.*;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.UserVo;
import com.baomidou.mybatisplus.extension.service.IService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IUserService  {
    ResponseEntity<UserVo> create(CreateUserDto user, boolean b);

    List<Permission> getRoleByUserId(User user);

    ResponseEntity<User> getUserInfo(String email);

    ResponseEntity<UserVo> removeUserInfo(String email);

    ResponseEntity<UserVo> updateUserInfo(UpdateUserDto updateUserDto);

    PageWrapper<UserVo> getAllUser(PaginationQueryDto paginationQuery, String name, Integer[] role, String email);

    ResponseEntity<?> updatePwdAdmin(@Valid UpdatePwdAdminDto dto);

    void updatePwdUser(@Valid UpdatePwdUserDto dto);

    ResponseEntity<List<UserVo>> batchDeleteUser(List<String> emails);
}
