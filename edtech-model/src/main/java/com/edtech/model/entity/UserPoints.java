package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户积分与统计
 */
@Data
@TableName("user_points")
public class UserPoints implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 总积分
     */
    private Integer totalPoints;

    /**
     * 当前连胜天数
     */
    private Integer currentStreak;

    /**
     * 最长连胜天数
     */
    private Integer longestStreak;

    /**
     * 最后活跃日期
     */
    private LocalDate lastActiveDate;

    /**
     * 总练习题目数
     */
    private Integer totalPracticeCount;

    /**
     * 总正确题目数
     */
    private Integer totalCorrectCount;

    /**
     * 总练习时长(分钟)
     */
    private Integer totalPracticeTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
