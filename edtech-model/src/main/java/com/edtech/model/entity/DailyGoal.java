package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日目标
 */
@Data
@TableName("daily_goal")
public class DailyGoal implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 目标日期
     */
    private LocalDate goalDate;

    /**
     * 目标题数
     */
    private Integer targetQuestions;

    /**
     * 目标时长(分钟)
     */
    private Integer targetMinutes;

    /**
     * 已完成题数
     */
    private Integer completedQuestions;

    /**
     * 已完成时长
     */
    private Integer completedMinutes;

    /**
     * 是否完成
     */
    private Integer isCompleted;

    /**
     * 是否已领取奖励
     */
    private Integer rewardClaimed;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
