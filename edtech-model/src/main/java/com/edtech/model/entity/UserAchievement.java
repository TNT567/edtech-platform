package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户已获成就
 */
@Data
@TableName("user_achievement")
public class UserAchievement implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long achievementId;

    /**
     * 解锁时间
     */
    private LocalDateTime unlockedAt;
}
