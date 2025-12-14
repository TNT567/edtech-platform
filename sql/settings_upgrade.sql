USE edtech_db;

CREATE TABLE IF NOT EXISTS `user_settings` (
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `grade` VARCHAR(20) DEFAULT NULL COMMENT '年级',
    `subject` VARCHAR(50) DEFAULT NULL COMMENT '主攻学科',
    `goal` VARCHAR(255) DEFAULT NULL COMMENT '学习目标',
    
    `daily_goal` INT DEFAULT 30 COMMENT '每日题目目标',
    `difficulty_preference` INT DEFAULT 50 COMMENT '难度偏好 0-100',
    `strategy_weights` JSON DEFAULT NULL COMMENT '策略权重配置',
    `correction_mode` TINYINT(1) DEFAULT 0 COMMENT '纠错模式开关',
    `duration_reminder` TINYINT(1) DEFAULT 0 COMMENT '时长提醒开关',
    `duration_reminder_minutes` INT DEFAULT 45 COMMENT '时长提醒阈值',
    `night_pause` TINYINT(1) DEFAULT 1 COMMENT '晚间暂停开关',
    `night_pause_start` VARCHAR(5) DEFAULT '22:00',
    `night_pause_end` VARCHAR(5) DEFAULT '07:00',
    
    `notify_daily` TINYINT(1) DEFAULT 1,
    `notify_daily_time` VARCHAR(5) DEFAULT '20:00',
    `notify_weekly` TINYINT(1) DEFAULT 1,
    `notify_achievement` TINYINT(1) DEFAULT 1,
    `notify_browser` TINYINT(1) DEFAULT 1,
    `notify_email` TINYINT(1) DEFAULT 0,
    
    `theme` VARCHAR(20) DEFAULT 'system',
    `font_size` VARCHAR(10) DEFAULT 'medium',
    `animations_enabled` TINYINT(1) DEFAULT 1,
    `sound_enabled` TINYINT(1) DEFAULT 1,
    
    `privacy_visibility` VARCHAR(20) DEFAULT 'private' COMMENT 'private/parent/teacher',
    `data_contribution` TINYINT(1) DEFAULT 0,
    
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户设置表';

CREATE TABLE IF NOT EXISTS `parent_bindings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` BIGINT NOT NULL COMMENT '家长用户ID',
    `student_id` BIGINT NOT NULL COMMENT '学生用户ID',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/ACTIVE/REJECTED',
    `permissions` JSON DEFAULT NULL COMMENT '授权查看范围',
    `daily_time_limit` INT DEFAULT 120 COMMENT '每日最大时长限制(分钟)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_parent_student` (`parent_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家长绑定表';
