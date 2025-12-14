package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.LeaderboardWeekly;
import com.edtech.model.entity.User;
import com.edtech.model.entity.UserPoints;
import com.edtech.model.mapper.LeaderboardWeeklyMapper;
import com.edtech.model.mapper.UserMapper;
import com.edtech.model.mapper.UserPointsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@Slf4j
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardWeeklyMapper leaderboardWeeklyMapper;
    private final UserPointsMapper userPointsMapper;
    private final UserMapper userMapper;

    /**
     * 获取本周排行榜
     */
    @GetMapping("/weekly")
    public Map<String, Object> getWeeklyLeaderboard(
            @RequestParam(defaultValue = "points") String type,
            @RequestParam(defaultValue = "50") int limit) {
        
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        // Get weekly leaderboard data
        List<LeaderboardWeekly> entries;
        switch (type) {
            case "streak":
                entries = leaderboardWeeklyMapper.selectTopByStreak(weekStart, limit);
                break;
            case "practice":
                entries = leaderboardWeeklyMapper.selectTopByPractice(weekStart, limit);
                break;
            default:
                entries = leaderboardWeeklyMapper.selectTopByPoints(weekStart, limit);
        }

        // If no weekly data, fallback to user_points table
        if (entries.isEmpty()) {
            return getFallbackLeaderboard(type, limit);
        }

        // Get user info for display
        List<Long> userIds = entries.stream().map(LeaderboardWeekly::getUserId).collect(Collectors.toList());
        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<User> users = userMapper.selectBatchIds(userIds);
            userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        }

        // Build response
        List<Map<String, Object>> rankings = new ArrayList<>();
        int rank = 1;
        for (LeaderboardWeekly entry : entries) {
            Map<String, Object> item = new HashMap<>();
            item.put("rank", rank++);
            item.put("userId", entry.getUserId());
            
            User user = userMap.get(entry.getUserId());
            item.put("nickname", user != null ? user.getNickname() : "用户" + entry.getUserId());
            item.put("avatar", user != null ? user.getAvatar() : "/avatars/default.png");
            
            item.put("weeklyPoints", entry.getWeeklyPoints());
            item.put("weeklyStreak", entry.getWeeklyStreak());
            item.put("weeklyPractice", entry.getWeeklyPracticeCount());
            
            rankings.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("weekStart", weekStart.toString());
        result.put("rankings", rankings);
        return result;
    }

    /**
     * Fallback to user_points when no weekly data
     */
    private Map<String, Object> getFallbackLeaderboard(String type, int limit) {
        List<UserPoints> allPoints = userPointsMapper.selectList(
                new LambdaQueryWrapper<UserPoints>()
                        .orderByDesc(type.equals("streak") ? UserPoints::getCurrentStreak :
                                type.equals("practice") ? UserPoints::getTotalPracticeCount :
                                        UserPoints::getTotalPoints)
                        .last("LIMIT " + limit));

        List<Long> userIds = allPoints.stream().map(UserPoints::getUserId).collect(Collectors.toList());
        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<User> users = userMapper.selectBatchIds(userIds);
            userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        }

        List<Map<String, Object>> rankings = new ArrayList<>();
        int rank = 1;
        for (UserPoints pts : allPoints) {
            Map<String, Object> item = new HashMap<>();
            item.put("rank", rank++);
            item.put("userId", pts.getUserId());
            
            User user = userMap.get(pts.getUserId());
            item.put("nickname", user != null ? user.getNickname() : "用户" + pts.getUserId());
            item.put("avatar", user != null ? user.getAvatar() : "/avatars/default.png");
            
            item.put("weeklyPoints", pts.getTotalPoints());
            item.put("weeklyStreak", pts.getCurrentStreak());
            item.put("weeklyPractice", pts.getTotalPracticeCount());
            
            rankings.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("weekStart", LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toString());
        result.put("rankings", rankings);
        return result;
    }

    /**
     * 获取用户的排名
     */
    @GetMapping("/rank/{userId}")
    public Map<String, Object> getUserRank(@PathVariable Long userId) {
        // Get user's points
        UserPoints myPoints = userPointsMapper.selectOne(
                new LambdaQueryWrapper<UserPoints>().eq(UserPoints::getUserId, userId));
        
        if (myPoints == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("pointsRank", 0);
            result.put("streakRank", 0);
            result.put("practiceRank", 0);
            return result;
        }

        // Calculate ranks by counting users with higher scores
        Long pointsRank = userPointsMapper.selectCount(
                new LambdaQueryWrapper<UserPoints>()
                        .gt(UserPoints::getTotalPoints, myPoints.getTotalPoints())) + 1;
        
        Long streakRank = userPointsMapper.selectCount(
                new LambdaQueryWrapper<UserPoints>()
                        .gt(UserPoints::getCurrentStreak, myPoints.getCurrentStreak())) + 1;
        
        Long practiceRank = userPointsMapper.selectCount(
                new LambdaQueryWrapper<UserPoints>()
                        .gt(UserPoints::getTotalPracticeCount, myPoints.getTotalPracticeCount())) + 1;

        Map<String, Object> result = new HashMap<>();
        result.put("pointsRank", pointsRank);
        result.put("streakRank", streakRank);
        result.put("practiceRank", practiceRank);
        result.put("totalPoints", myPoints.getTotalPoints());
        result.put("currentStreak", myPoints.getCurrentStreak());
        result.put("totalPractice", myPoints.getTotalPracticeCount());
        return result;
    }
}
