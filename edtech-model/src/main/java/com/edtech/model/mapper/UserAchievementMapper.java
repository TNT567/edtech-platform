package com.edtech.model.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edtech.model.entity.UserAchievement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserAchievementMapper extends BaseMapper<UserAchievement> {
    
    @Select("SELECT achievement_id FROM user_achievement WHERE user_id = #{userId}")
    List<Long> selectAchievementIdsByUserId(Long userId);
}
