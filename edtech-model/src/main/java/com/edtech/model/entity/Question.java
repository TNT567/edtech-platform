package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 题目实体
 */
@Data
@TableName("question")
public class Question implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 题目 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 题干
     */
    private String content;

    /**
     * 难度等级 (0.0-1.0)
     */
    private BigDecimal difficulty;

    /**
     * 关联的知识点 ID
     */
    private Long knowledgePointId;

    /**
     * 题型 (1:单选, 2:填空, etc)
     */
    private Integer type;

    /**
     * 选项 (JSON)
     */
    private String options;

    /**
     * 参考答案
     */
    private String correctAnswer;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
