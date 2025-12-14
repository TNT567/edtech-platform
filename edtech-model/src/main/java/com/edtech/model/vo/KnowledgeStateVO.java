package com.edtech.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 知识状态VO - 用于前端雷达图展示
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeStateVO implements Serializable {

    /**
     * 知识点 ID
     */
    private Long knowledgePointId;

    /**
     * 知识点名称
     */
    private String knowledgePointName;

    /**
     * 掌握概率 (0-1)
     */
    private BigDecimal score;

    /**
     * 掌握状态描述 (e.g. "熟练", "薄弱")
     */
    private String level;
}
