package com.edtech.model.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edtech.model.entity.PracticeSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface PracticeSessionMapper extends BaseMapper<PracticeSession> {

    @Select("SELECT SUM(duration_minutes) FROM practice_session WHERE user_id = #{userId} AND session_date = #{date}")
    Integer selectTotalMinutesByUserAndDate(Long userId, LocalDate date);

    @Select("SELECT session_date, SUM(duration_minutes) as duration_minutes FROM practice_session WHERE user_id = #{userId} AND session_date >= #{startDate} GROUP BY session_date")
    List<PracticeSession> selectDailyStatsSince(Long userId, LocalDate startDate);
}
