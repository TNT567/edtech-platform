package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 练习会话记录
 */
@Data
@TableName("practice_session")
public class PracticeSession implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 练习日期
     */
    private LocalDate sessionDate;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 时长(分钟)
     */
    private Integer durationMinutes;

    /**
     * 尝试题数
     */
    private Integer questionsAttempted;

    /**
     * 正确题数
     */
    private Integer questionsCorrect;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
