package com.edtech.model.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edtech.model.entity.LeaderboardWeekly;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface LeaderboardWeeklyMapper extends BaseMapper<LeaderboardWeekly> {

    @Select("SELECT * FROM leaderboard_weekly WHERE week_start = #{weekStart} ORDER BY weekly_points DESC LIMIT #{limit}")
    List<LeaderboardWeekly> selectTopByPoints(LocalDate weekStart, int limit);

    @Select("SELECT * FROM leaderboard_weekly WHERE week_start = #{weekStart} ORDER BY weekly_streak DESC LIMIT #{limit}")
    List<LeaderboardWeekly> selectTopByStreak(LocalDate weekStart, int limit);

    @Select("SELECT * FROM leaderboard_weekly WHERE week_start = #{weekStart} ORDER BY weekly_practice_count DESC LIMIT #{limit}")
    List<LeaderboardWeekly> selectTopByPractice(LocalDate weekStart, int limit);
}
