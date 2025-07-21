package com.TinyPro.service.imp;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.CreateUserDto;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.TinyPro.mappers.UserMapper;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IRoleService;
import com.TinyPro.service.IUserService;
import com.TinyPro.service.jpa.IUserRepository;
import com.TinyPro.utils.LocaleUntil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IUserServiceImpl extends ServiceImpl<UserMapper,User>implements IUserService {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private IRoleService roleService;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private RedisUtil redisUtil;
    @Override
    public ResponseEntity<String> create(CreateUserDto user) {
        try {
            QueryWrapper<User> wrapper = new QueryWrapper<>();
            wrapper.eq("email", user.getEmail());
            User selectOne = userMapper.selectOne(wrapper);
            if (selectOne != null) {
                //TODO 错误处理
                String message = messageSource.getMessage("exception.user.userExists", null, LocaleUntil.getLocale());
                return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
            }
            BeanUtils.copyProperties(user, selectOne);
            QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
            queryWrapper.in("id", user.getRoleIds());
            List<Role> roleList = roleService.list(queryWrapper);
            selectOne.setRole(roleList);
            //使用jpa保存创建的user
            userMapper.insert(selectOne);
        }catch (Exception e){
            throw new RuntimeException(e);
        }
        return new ResponseEntity<>("success",HttpStatus.OK);
    }

    @Override
    public List<Integer> getRoleByUserId(User user) {
       return userMapper.getRoleByUserId(user.getId());
    }

    @Override
    public ResponseEntity<User> getUserInfo(String email) {
        //TODO 获取用户角色
        return null;
    }

    @Override
    public ResponseEntity<String> removeUserInfo(String email) {
        try {


            QueryWrapper<User> wrapper = new QueryWrapper<>();
            wrapper.eq("email", email);
            User user = userMapper.selectOne(wrapper);
            if (ObjectUtils.isEmpty(user)) {
                return new ResponseEntity<>("用户不存在", HttpStatus.OK);
            }
            String key = Contants.UserJwtTop + user.getEmail() + Contants.UserJwtbt;
            redisUtil.deleteValue(key);
            userMapper.delete(wrapper);
            return new ResponseEntity<>("删除成功", HttpStatus.OK);
        }catch (Exception e){
            String message = messageSource.getMessage("exception.user.userNumberNull", null, LocaleUntil.getLocale());
            return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
        }
    }
}
