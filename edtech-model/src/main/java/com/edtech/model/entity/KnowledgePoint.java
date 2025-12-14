package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 知识点实体
 */
@Data
@TableName("knowledge_point")
public class KnowledgePoint implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 知识点名称
     */
    private String name;

    /**
     * 描述
     */
    private String description;

    /**
     * 所属学科
     */
    private String subject;

    /**
     * 父级ID
     */
    private Long parentId;

    /**
     * BKT: 初始掌握概率 P(L0)
     */
    private Double pInit;

    /**
     * BKT: 学习转移概率 P(T)
     */
    private Double pTransit;

    /**
     * BKT: 猜对概率 P(G)
     */
    private Double pGuess;

    /**
     * BKT: 失误概率 P(S)
     */
    private Double pSlip;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
