package com.TinyPro.mappers;

import com.TinyPro.entity.po.Role;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

public interface RoleMapper extends BaseMapper<Role> {
    void removeUserRById(@Param("roleId") Integer id);
}
