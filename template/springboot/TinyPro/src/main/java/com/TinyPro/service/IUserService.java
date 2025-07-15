package com.TinyPro.service;

import com.TinyPro.entity.po.User;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IUserService extends IService<User> {
    User create(User user);
}
