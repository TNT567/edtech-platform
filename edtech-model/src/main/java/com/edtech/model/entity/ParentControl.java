package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 家长控制设置
 */
@Data
@TableName("parent_control")
public class ParentControl implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 家长用户 ID
     */
    private Long parentId;

    /**
     * 孩子用户 ID
     */
    private Long childId;

    /**
     * 每日时间限制(分钟)
     */
    private Integer dailyTimeLimit;

    /**
     * 允许开始时间(小时)
     */
    private Integer allowStartHour;

    /**
     * 允许结束时间(小时)
     */
    private Integer allowEndHour;

    /**
     * 是否发送周报
     */
    private Integer notifyWeeklyReport;

    /**
     * 薄弱点通知
     */
    private Integer notifyWeakPoints;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
