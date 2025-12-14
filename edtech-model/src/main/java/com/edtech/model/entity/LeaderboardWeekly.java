package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 周排行榜快照
 */
@Data
@TableName("leaderboard_weekly")
public class LeaderboardWeekly implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 周开始日期
     */
    private LocalDate weekStart;

    /**
     * 本周积分
     */
    private Integer weeklyPoints;

    /**
     * 本周连胜
     */
    private Integer weeklyStreak;

    /**
     * 本周练习数
     */
    private Integer weeklyPracticeCount;

    /**
     * 积分排名
     */
    private Integer rankPoints;

    /**
     * 连胜排名
     */
    private Integer rankStreak;

    /**
     * 练习排名
     */
    private Integer rankPractice;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
