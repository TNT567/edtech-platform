package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 知识状态 (DKT输出)
 */
@Data
@TableName("knowledge_state")
public class KnowledgeState implements Serializable {

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
     * 知识点 ID
     */
    private Long knowledgePointId;

    /**
     * 掌握概率 (0-1)
     */
    private BigDecimal masteryProbability;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
