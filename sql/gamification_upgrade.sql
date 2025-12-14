-- Gamification & Feature Upgrade SQL (EdTech Platform)
-- Run this after init.sql

USE `edtech_db`;

-- ==========================================
-- 1. User Points (用户积分)
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `total_points` INT DEFAULT '0' COMMENT '总积分',
  `current_streak` INT DEFAULT '0' COMMENT '当前连胜天数',
  `longest_streak` INT DEFAULT '0' COMMENT '最长连胜天数',
  `last_active_date` DATE DEFAULT NULL COMMENT '最后活跃日期',
  `total_practice_count` INT DEFAULT '0' COMMENT '总练习题目数',
  `total_correct_count` INT DEFAULT '0' COMMENT '总正确题目数',
  `total_practice_time` INT DEFAULT '0' COMMENT '总练习时长(分钟)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB COMMENT='用户积分与统计';

-- ==========================================
-- 2. Achievement Badge Definitions (成就徽章定义)
-- ==========================================
CREATE TABLE IF NOT EXISTS `achievement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT '成就代码 (e.g. FIRST_BLOOD)',
  `name` VARCHAR(100) NOT NULL COMMENT '成就名称',
  `description` TEXT COMMENT '成就描述',
  `icon` VARCHAR(100) DEFAULT 'trophy' COMMENT '图标名称',
  `category` VARCHAR(50) DEFAULT 'general' COMMENT '分类 (streak, mastery, practice)',
  `rarity` VARCHAR(20) DEFAULT 'common' COMMENT '稀有度 (common, rare, epic, legendary)',
  `points_reward` INT DEFAULT '10' COMMENT '积分奖励',
  `condition_type` VARCHAR(50) COMMENT '解锁条件类型',
  `condition_value` INT COMMENT '解锁条件值',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB COMMENT='成就徽章定义';

-- ==========================================
-- 3. User Achievements (用户已获成就)
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_achievement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `achievement_id` BIGINT NOT NULL COMMENT '成就 ID',
  `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_ach` (`user_id`, `achievement_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB COMMENT='用户已获成就';

-- ==========================================
-- 4. Daily Goals (每日目标)
-- ==========================================
CREATE TABLE IF NOT EXISTS `daily_goal` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `goal_date` DATE NOT NULL COMMENT '目标日期',
  `target_questions` INT DEFAULT '10' COMMENT '目标题数',
  `target_minutes` INT DEFAULT '30' COMMENT '目标时长(分钟)',
  `completed_questions` INT DEFAULT '0' COMMENT '已完成题数',
  `completed_minutes` INT DEFAULT '0' COMMENT '已完成时长',
  `is_completed` TINYINT(1) DEFAULT '0' COMMENT '是否完成',
  `reward_claimed` TINYINT(1) DEFAULT '0' COMMENT '是否已领取奖励',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `goal_date`),
  INDEX `idx_date` (`goal_date`)
) ENGINE=InnoDB COMMENT='每日目标';

-- ==========================================
-- 5. Practice Session (练习会话)
-- ==========================================
CREATE TABLE IF NOT EXISTS `practice_session` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `session_date` DATE NOT NULL COMMENT '练习日期',
  `start_time` DATETIME COMMENT '开始时间',
  `end_time` DATETIME COMMENT '结束时间',
  `duration_minutes` INT DEFAULT '0' COMMENT '时长(分钟)',
  `questions_attempted` INT DEFAULT '0' COMMENT '尝试题数',
  `questions_correct` INT DEFAULT '0' COMMENT '正确题数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_date` (`user_id`, `session_date`)
) ENGINE=InnoDB COMMENT='练习会话记录';

-- ==========================================
-- 6. Parent Control Settings (家长控制设置)
-- ==========================================
CREATE TABLE IF NOT EXISTS `parent_control` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `parent_id` BIGINT NOT NULL COMMENT '家长用户 ID',
  `child_id` BIGINT NOT NULL COMMENT '孩子用户 ID',
  `daily_time_limit` INT DEFAULT '120' COMMENT '每日时间限制(分钟)',
  `allow_start_hour` INT DEFAULT '8' COMMENT '允许开始时间(小时)',
  `allow_end_hour` INT DEFAULT '22' COMMENT '允许结束时间(小时)',
  `notify_weekly_report` TINYINT(1) DEFAULT '1' COMMENT '是否发送周报',
  `notify_weak_points` TINYINT(1) DEFAULT '1' COMMENT '薄弱点通知',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_parent_child` (`parent_id`, `child_id`)
) ENGINE=InnoDB COMMENT='家长控制设置';

-- ==========================================
-- 7. Weekly Leaderboard Snapshot (周排行榜快照)
-- ==========================================
CREATE TABLE IF NOT EXISTS `leaderboard_weekly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `week_start` DATE NOT NULL COMMENT '周开始日期',
  `weekly_points` INT DEFAULT '0' COMMENT '本周积分',
  `weekly_streak` INT DEFAULT '0' COMMENT '本周连胜',
  `weekly_practice_count` INT DEFAULT '0' COMMENT '本周练习数',
  `rank_points` INT DEFAULT '0' COMMENT '积分排名',
  `rank_streak` INT DEFAULT '0' COMMENT '连胜排名',
  `rank_practice` INT DEFAULT '0' COMMENT '练习排名',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_week` (`user_id`, `week_start`),
  INDEX `idx_week` (`week_start`)
) ENGINE=InnoDB COMMENT='周排行榜快照';

-- ==========================================
-- 8. Users Table (if not exists)
-- ==========================================
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码 (hashed)',
  `email` VARCHAR(100) COMMENT '邮箱',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT '/avatars/default.png' COMMENT '头像URL',
  `role` VARCHAR(20) DEFAULT 'STUDENT' COMMENT '角色 (ADMIN, TEACHER, STUDENT, PARENT)',
  `grade` VARCHAR(20) COMMENT '年级',
  `school` VARCHAR(100) COMMENT '学校',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB COMMENT='用户表';

-- ==========================================
-- Insert Initial Achievements
-- ==========================================
INSERT INTO `achievement` (`code`, `name`, `description`, `icon`, `category`, `rarity`, `points_reward`, `condition_type`, `condition_value`) VALUES
('FIRST_BLOOD', '初试锋芒', '完成第一道练习题', 'zap', 'practice', 'common', 10, 'practice_count', 1),
('STREAK_3', '小小坚持', '连续学习3天', 'flame', 'streak', 'common', 30, 'streak_days', 3),
('STREAK_7', '周周进步', '连续学习7天', 'flame', 'streak', 'rare', 70, 'streak_days', 7),
('STREAK_30', '月度学霸', '连续学习30天', 'flame', 'streak', 'epic', 300, 'streak_days', 30),
('PRACTICE_50', '勤学苦练', '累计完成50道题', 'book-open', 'practice', 'common', 50, 'practice_count', 50),
('PRACTICE_100', '百题斩', '累计完成100道题', 'book-open', 'practice', 'rare', 100, 'practice_count', 100),
('PRACTICE_500', '五百题王', '累计完成500道题', 'book-open', 'practice', 'epic', 500, 'practice_count', 500),
('MASTERY_1', '初露头角', '首次掌握一个知识点', 'medal', 'mastery', 'common', 20, 'mastery_count', 1),
('MASTERY_5', '融会贯通', '掌握5个知识点', 'medal', 'mastery', 'rare', 100, 'mastery_count', 5),
('MASTERY_ALL', '全科达人', '掌握所有知识点', 'crown', 'mastery', 'legendary', 1000, 'mastery_count', -1),
('ACCURACY_90', '精准射手', '单次练习正确率达90%', 'target', 'accuracy', 'rare', 80, 'accuracy_percent', 90),
('SPEED_DEMON', '闪电侠', '5分钟内完成10道题', 'timer', 'speed', 'rare', 60, 'speed_questions', 10),
('NIGHT_OWL', '夜猫子', '在22点后完成练习', 'moon', 'special', 'common', 15, 'special', 1),
('EARLY_BIRD', '早起鸟儿', '在6点前完成练习', 'sun', 'special', 'common', 15, 'special', 2),
('PERFECTIONIST', '完美主义者', '连续答对20题', 'star', 'accuracy', 'epic', 200, 'consecutive_correct', 20);

-- ==========================================
-- Insert Sample Users for Testing
-- ==========================================
INSERT INTO `user` (`id`, `username`, `password`, `nickname`, `role`, `grade`) VALUES
(1, 'student', '$2a$10$dummyhash', '小明同学', 'STUDENT', '高三'),
(2, 'admin', '$2a$10$dummyhash', '管理员', 'ADMIN', NULL),
(3, 'parent', '$2a$10$dummyhash', '小明家长', 'PARENT', NULL)
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- ==========================================
-- Insert Sample User Points
-- ==========================================
INSERT INTO `user_points` (`user_id`, `total_points`, `current_streak`, `longest_streak`, `last_active_date`, `total_practice_count`, `total_correct_count`, `total_practice_time`) VALUES
(1, 1250, 7, 15, CURDATE(), 156, 128, 420)
ON DUPLICATE KEY UPDATE `total_points` = VALUES(`total_points`);

-- ==========================================
-- Insert Sample Daily Goal
-- ==========================================
INSERT INTO `daily_goal` (`user_id`, `goal_date`, `target_questions`, `target_minutes`, `completed_questions`, `completed_minutes`, `is_completed`) VALUES
(1, CURDATE(), 15, 30, 8, 18, 0)
ON DUPLICATE KEY UPDATE `completed_questions` = VALUES(`completed_questions`);

-- ==========================================
-- Insert Sample User Achievements
-- ==========================================
INSERT INTO `user_achievement` (`user_id`, `achievement_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 5), (1, 8)
ON DUPLICATE KEY UPDATE `unlocked_at` = CURRENT_TIMESTAMP;

-- ==========================================
-- Insert Parent Control for Demo
-- ==========================================
INSERT INTO `parent_control` (`parent_id`, `child_id`, `daily_time_limit`, `allow_start_hour`, `allow_end_hour`) VALUES
(3, 1, 120, 8, 22)
ON DUPLICATE KEY UPDATE `daily_time_limit` = VALUES(`daily_time_limit`);
