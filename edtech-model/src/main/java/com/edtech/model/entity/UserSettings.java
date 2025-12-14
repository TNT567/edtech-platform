package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("user_settings")
public class UserSettings implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private Long userId;

    private String avatarUrl;
    private String nickname;
    private String realName;
    private String grade;
    private String subject;
    private String goal;

    // Learning Preferences
    private Integer dailyGoal;
    private Integer difficultyPreference;
    private String strategyWeights; // JSON string
    private Boolean correctionMode;
    private Boolean durationReminder;
    private Integer durationReminderMinutes;
    private Boolean nightPause;
    private String nightPauseStart;
    private String nightPauseEnd;

    // Notifications
    private Boolean notifyDaily;
    private String notifyDailyTime;
    private Boolean notifyWeekly;
    private Boolean notifyAchievement;
    private Boolean notifyBrowser;
    private Boolean notifyEmail;

    // Appearance
    private String theme;
    private String fontSize;
    private Boolean animationsEnabled;
    private Boolean soundEnabled;

    // Privacy
    private String privacyVisibility;
    private Boolean dataContribution;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
