package com.TinyPro.mappers;

import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface UserMapper extends BaseMapper<User> {
    List<Integer> getRoleByUserId(@Param("userId") Integer id);
}
