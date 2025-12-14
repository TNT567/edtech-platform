package com.edtech.model.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edtech.model.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
