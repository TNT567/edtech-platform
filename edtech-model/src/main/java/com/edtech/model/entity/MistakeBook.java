package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 智能错题本
 */
@Data
@TableName("mistake_book")
public class MistakeBook implements Serializable {

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
     * 错误次数
     */
    private Integer errorCount;

    /**
     * 最近一次错误时间
     */
    private LocalDateTime lastErrorTime;

    /**
     * 是否已掌握
     */
    private Integer isResolved;
}
