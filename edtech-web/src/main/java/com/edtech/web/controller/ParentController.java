package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.*;
import com.edtech.model.mapper.*;
import com.edtech.model.vo.KnowledgeStateVO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parent")
@Slf4j
@RequiredArgsConstructor
public class ParentController {

    private final ParentControlMapper parentControlMapper;
    private final UserMapper userMapper;
    private final UserPointsMapper userPointsMapper;
    private final KnowledgeStateMapper knowledgeStateMapper;
    private final KnowledgePointMapper knowledgePointMapper;
    private final PracticeSessionMapper practiceSessionMapper;
    private final DailyGoalMapper dailyGoalMapper;

    /**
     * 获取家长绑定的孩子列表
     */
    @GetMapping("/children/{parentId}")
    public List<Map<String, Object>> getChildren(@PathVariable Long parentId) {
        List<ParentControl> controls = parentControlMapper.selectList(
                new LambdaQueryWrapper<ParentControl>().eq(ParentControl::getParentId, parentId));
        
        if (controls.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> childIds = controls.stream().map(ParentControl::getChildId).collect(Collectors.toList());
        List<User> children = userMapper.selectBatchIds(childIds);
        Map<Long, User> childMap = children.stream().collect(Collectors.toMap(User::getId, u -> u));

        List<Map<String, Object>> result = new ArrayList<>();
        for (ParentControl ctrl : controls) {
            User child = childMap.get(ctrl.getChildId());
            if (child == null) continue;
            
            Map<String, Object> item = new HashMap<>();
            item.put("childId", child.getId());
            item.put("nickname", child.getNickname());
            item.put("avatar", child.getAvatar());
            item.put("grade", child.getGrade());
            item.put("dailyTimeLimit", ctrl.getDailyTimeLimit());
            item.put("allowStartHour", ctrl.getAllowStartHour());
            item.put("allowEndHour", ctrl.getAllowEndHour());
            result.add(item);
        }
        return result;
    }

    /**
     * 获取孩子的详细学习数据
     */
    @GetMapping("/child-detail/{childId}")
    public Map<String, Object> getChildDetail(@PathVariable Long childId) {
        Map<String, Object> result = new HashMap<>();
        
        // User info
        User child = userMapper.selectById(childId);
        if (child != null) {
            result.put("nickname", child.getNickname());
            result.put("avatar", child.getAvatar());
            result.put("grade", child.getGrade());
        }

        // Points & Stats
        UserPoints points = userPointsMapper.selectOne(
                new LambdaQueryWrapper<UserPoints>().eq(UserPoints::getUserId, childId));
        if (points != null) {
            result.put("totalPoints", points.getTotalPoints());
            result.put("currentStreak", points.getCurrentStreak());
            result.put("totalPracticeCount", points.getTotalPracticeCount());
            result.put("totalPracticeTime", points.getTotalPracticeTime());
        }

        // Today's practice time
        LocalDate today = LocalDate.now();
        Integer todayMinutes = practiceSessionMapper.selectTotalMinutesByUserAndDate(childId, today);
        result.put("todayPracticeMinutes", todayMinutes != null ? todayMinutes : 0);

        // Today's goal progress
        DailyGoal todayGoal = dailyGoalMapper.selectOne(
                new LambdaQueryWrapper<DailyGoal>()
                        .eq(DailyGoal::getUserId, childId)
                        .eq(DailyGoal::getGoalDate, today));
        if (todayGoal != null) {
            result.put("todayGoalProgress", Map.of(
                    "targetQuestions", todayGoal.getTargetQuestions(),
                    "completedQuestions", todayGoal.getCompletedQuestions(),
                    "targetMinutes", todayGoal.getTargetMinutes(),
                    "completedMinutes", todayGoal.getCompletedMinutes(),
                    "isCompleted", todayGoal.getIsCompleted()
            ));
        }

        // Knowledge radar data (weak points)
        List<KnowledgeState> states = knowledgeStateMapper.selectList(
                new LambdaQueryWrapper<KnowledgeState>().eq(KnowledgeState::getStudentId, childId));
        
        if (!states.isEmpty()) {
            List<Long> kpIds = states.stream().map(KnowledgeState::getKnowledgePointId).collect(Collectors.toList());
            List<KnowledgePoint> kps = knowledgePointMapper.selectBatchIds(kpIds);
            Map<Long, String> kpNameMap = kps.stream()
                    .collect(Collectors.toMap(KnowledgePoint::getId, KnowledgePoint::getName));

            List<KnowledgeStateVO> radarData = states.stream().map(state -> {
                String name = kpNameMap.getOrDefault(state.getKnowledgePointId(), "Unknown");
                BigDecimal score = state.getMasteryProbability();
                String level = score.doubleValue() >= 0.8 ? "Master" :
                        score.doubleValue() >= 0.5 ? "Proficient" : "Novice";
                return new KnowledgeStateVO(state.getKnowledgePointId(), name, score, level);
            }).collect(Collectors.toList());

            result.put("radarData", radarData);
            
            // Weak points (bottom 3)
            List<KnowledgeStateVO> weakPoints = radarData.stream()
                    .sorted(Comparator.comparing(KnowledgeStateVO::getScore))
                    .limit(3)
                    .collect(Collectors.toList());
            result.put("weakPoints", weakPoints);
        }

        return result;
    }

    /**
     * 更新家长控制设置
     */
    @PostMapping("/settings")
    public Map<String, Object> updateSettings(@RequestBody ParentSettingsRequest request) {
        ParentControl ctrl = parentControlMapper.selectOne(
                new LambdaQueryWrapper<ParentControl>()
                        .eq(ParentControl::getParentId, request.getParentId())
                        .eq(ParentControl::getChildId, request.getChildId()));
        
        Map<String, Object> result = new HashMap<>();
        if (ctrl == null) {
            result.put("success", false);
            result.put("message", "未找到绑定关系");
            return result;
        }

        if (request.getDailyTimeLimit() != null) {
            ctrl.setDailyTimeLimit(request.getDailyTimeLimit());
        }
        if (request.getAllowStartHour() != null) {
            ctrl.setAllowStartHour(request.getAllowStartHour());
        }
        if (request.getAllowEndHour() != null) {
            ctrl.setAllowEndHour(request.getAllowEndHour());
        }
        if (request.getNotifyWeeklyReport() != null) {
            ctrl.setNotifyWeeklyReport(request.getNotifyWeeklyReport() ? 1 : 0);
        }

        parentControlMapper.updateById(ctrl);
        result.put("success", true);
        result.put("message", "设置已更新");
        return result;
    }

    /**
     * 发送周报(模拟)
     */
    @PostMapping("/send-report/{childId}")
    public Map<String, Object> sendWeeklyReport(@PathVariable Long childId) {
        // In production: Generate PDF report and send via email/push
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "周报已发送到您的邮箱");
        return result;
    }

    @Data
    public static class ParentSettingsRequest {
        private Long parentId;
        private Long childId;
        private Integer dailyTimeLimit;
        private Integer allowStartHour;
        private Integer allowEndHour;
        private Boolean notifyWeeklyReport;
    }
}
