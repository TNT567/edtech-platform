package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 成就徽章定义
 */
@Data
@TableName("achievement")
public class Achievement implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 成就代码 (e.g. FIRST_BLOOD)
     */
    private String code;

    /**
     * 成就名称
     */
    private String name;

    /**
     * 成就描述
     */
    private String description;

    /**
     * 图标名称
     */
    private String icon;

    /**
     * 分类 (streak, mastery, practice)
     */
    private String category;

    /**
     * 稀有度 (common, rare, epic, legendary)
     */
    private String rarity;

    /**
     * 积分奖励
     */
    private Integer pointsReward;

    /**
     * 解锁条件类型
     */
    private String conditionType;

    /**
     * 解锁条件值
     */
    private Integer conditionValue;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
