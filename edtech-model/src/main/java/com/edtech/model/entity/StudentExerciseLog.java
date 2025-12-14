package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 学生答题记录 (DKT输入)
 */
@Data
@TableName("student_exercise_log")
public class StudentExerciseLog implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 学生 ID
     */
    private Long studentId;

    /**
     * 题目 ID
     */
    private Long questionId;

    /**
     * 答题结果 (0:错, 1:对)
     */
    private Integer result;

    /**
     * 耗时 (秒)
     */
    private Integer duration;

    /**
     * 答题时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime submitTime;
}
