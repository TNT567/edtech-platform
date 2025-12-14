package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.DailyGoal;
import com.edtech.model.entity.PracticeSession;
import com.edtech.model.mapper.DailyGoalMapper;
import com.edtech.model.mapper.PracticeSessionMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/daily-goal")
@Slf4j
@RequiredArgsConstructor
public class DailyGoalController {

    private final DailyGoalMapper dailyGoalMapper;
    private final PracticeSessionMapper practiceSessionMapper;

    /**
     * 获取今日目标
     */
    @GetMapping("/today/{userId}")
    public DailyGoal getTodayGoal(@PathVariable Long userId) {
        LocalDate today = LocalDate.now();
        DailyGoal goal = dailyGoalMapper.selectOne(
                new LambdaQueryWrapper<DailyGoal>()
                        .eq(DailyGoal::getUserId, userId)
                        .eq(DailyGoal::getGoalDate, today));
        
        if (goal == null) {
            // Create default goal for today
            goal = new DailyGoal();
            goal.setUserId(userId);
            goal.setGoalDate(today);
            goal.setTargetQuestions(10);
            goal.setTargetMinutes(30);
            goal.setCompletedQuestions(0);
            goal.setCompletedMinutes(0);
            goal.setIsCompleted(0);
            goal.setRewardClaimed(0);
            dailyGoalMapper.insert(goal);
        }
        return goal;
    }

    /**
     * 更新目标设置
     */
    @PostMapping("/update")
    public DailyGoal updateGoal(@RequestBody GoalUpdateRequest request) {
        LocalDate today = LocalDate.now();
        DailyGoal goal = dailyGoalMapper.selectOne(
                new LambdaQueryWrapper<DailyGoal>()
                        .eq(DailyGoal::getUserId, request.getUserId())
                        .eq(DailyGoal::getGoalDate, today));
        
        if (goal == null) {
            goal = new DailyGoal();
            goal.setUserId(request.getUserId());
            goal.setGoalDate(today);
            goal.setCompletedQuestions(0);
            goal.setCompletedMinutes(0);
            goal.setIsCompleted(0);
            goal.setRewardClaimed(0);
        }
        
        if (request.getTargetQuestions() != null) {
            goal.setTargetQuestions(request.getTargetQuestions());
        }
        if (request.getTargetMinutes() != null) {
            goal.setTargetMinutes(request.getTargetMinutes());
        }
        
        if (goal.getId() == null) {
            dailyGoalMapper.insert(goal);
        } else {
            dailyGoalMapper.updateById(goal);
        }
        return goal;
    }

    /**
     * 领取奖励
     */
    @PostMapping("/claim/{userId}")
    public Map<String, Object> claimReward(@PathVariable Long userId) {
        LocalDate today = LocalDate.now();
        DailyGoal goal = dailyGoalMapper.selectOne(
                new LambdaQueryWrapper<DailyGoal>()
                        .eq(DailyGoal::getUserId, userId)
                        .eq(DailyGoal::getGoalDate, today));
        
        Map<String, Object> result = new HashMap<>();
        if (goal != null && goal.getIsCompleted() == 1 && goal.getRewardClaimed() == 0) {
            goal.setRewardClaimed(1);
            dailyGoalMapper.updateById(goal);
            result.put("success", true);
            result.put("pointsEarned", 50); // Base reward
            result.put("message", "恭喜完成今日目标！获得50积分");
        } else {
            result.put("success", false);
            result.put("message", goal == null ? "今日目标不存在" : 
                    goal.getIsCompleted() == 0 ? "目标尚未完成" : "奖励已领取");
        }
        return result;
    }

    /**
     * 获取历史打卡日历(热力图数据)
     */
    @GetMapping("/calendar/{userId}")
    public List<Map<String, Object>> getCalendarData(@PathVariable Long userId,
            @RequestParam(defaultValue = "90") int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        List<DailyGoal> goals = dailyGoalMapper.selectList(
                new LambdaQueryWrapper<DailyGoal>()
                        .eq(DailyGoal::getUserId, userId)
                        .ge(DailyGoal::getGoalDate, startDate)
                        .orderByAsc(DailyGoal::getGoalDate));
        
        List<Map<String, Object>> calendar = new ArrayList<>();
        for (DailyGoal goal : goals) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", goal.getGoalDate().toString());
            day.put("completed", goal.getIsCompleted() == 1);
            day.put("questionsCompleted", goal.getCompletedQuestions());
            day.put("minutesCompleted", goal.getCompletedMinutes());
            // Calculate intensity (0-4) based on completion percentage
            double qPct = goal.getTargetQuestions() > 0 ? 
                    (double) goal.getCompletedQuestions() / goal.getTargetQuestions() : 0;
            int intensity = qPct >= 1.0 ? 4 : qPct >= 0.75 ? 3 : qPct >= 0.5 ? 2 : qPct > 0 ? 1 : 0;
            day.put("intensity", intensity);
            calendar.add(day);
        }
        return calendar;
    }

    @Data
    public static class GoalUpdateRequest {
        private Long userId;
        private Integer targetQuestions;
        private Integer targetMinutes;
    }
}
