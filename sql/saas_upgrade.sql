-- =================================================================
-- EdTech Platform Commercial SaaS Upgrade Schema (2025 Edition)
-- Features: RBAC, Multi-tenancy, Subscriptions, Gamification
-- =================================================================

USE edtech_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Multi-tenancy & Organization (机构管理)
CREATE TABLE IF NOT EXISTS `tenant` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT 'Institution Name',
    `domain` VARCHAR(50) UNIQUE COMMENT 'Subdomain for isolation',
    `plan_type` ENUM('FREE', 'PRO', 'ENTERPRISE') DEFAULT 'FREE',
    `expire_at` DATETIME,
    `config_json` JSON COMMENT 'Custom branding, features',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Advanced RBAC (Security)
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` BIGINT DEFAULT 0 COMMENT '0 for platform admins',
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL COMMENT 'Bcrypt hash',
    `email` VARCHAR(100),
    `phone` VARCHAR(20),
    `role` VARCHAR(20) NOT NULL DEFAULT 'STUDENT' COMMENT 'STUDENT, TEACHER, PARENT, ADMIN',
    `avatar` VARCHAR(255),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `role_permission` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(20) NOT NULL,
    `permission` VARCHAR(100) NOT NULL COMMENT 'e.g. course:read, user:write',
    UNIQUE KEY `uk_role_perm` (`role_name`, `permission`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Commercialization (Orders & Subscriptions)
CREATE TABLE IF NOT EXISTS `subscription_plan` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `duration_days` INT NOT NULL,
    `features` JSON COMMENT 'Feature flags enabled',
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `platform_order` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_no` VARCHAR(64) NOT NULL UNIQUE,
    `user_id` BIGINT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    `payment_method` VARCHAR(20) COMMENT 'STRIPE, ALIPAY, WECHAT',
    `transaction_id` VARCHAR(100),
    `plan_snapshot` JSON,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `paid_at` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Gamification & Growth (游戏化)
CREATE TABLE IF NOT EXISTS `user_points` (
    `user_id` BIGINT PRIMARY KEY,
    `total_points` INT DEFAULT 0,
    `current_streak` INT DEFAULT 0,
    `max_streak` INT DEFAULT 0,
    `last_activity_date` DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `badge` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(255),
    `condition_rule` VARCHAR(255) COMMENT 'Rule engine expression',
    `description` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_badge` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `badge_id` BIGINT NOT NULL,
    `awarded_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Content Enhancements (Video & Interactive)
CREATE TABLE IF NOT EXISTS `learning_resource` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `knowledge_point_id` BIGINT NOT NULL,
    `type` ENUM('VIDEO', 'PDF', 'INTERACTIVE') NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `meta_data` JSON COMMENT 'Duration, size, transcript',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Data Seeding
INSERT INTO `tenant` (`id`, `name`, `domain`, `plan_type`) VALUES (1, 'Default Platform', 'www', 'ENTERPRISE');
-- Default Admin (password: admin123)
INSERT INTO `user` (`id`, `tenant_id`, `username`, `password`, `role`, `email`) VALUES 
(1, 1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8ae13.t715.1q715.1q', 'ADMIN', 'admin@edtech.com');
-- Default Student (password: 123456)
INSERT INTO `user` (`id`, `tenant_id`, `username`, `password`, `role`) VALUES 
(2, 1, 'student', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8ae13.t715.1q715.1q', 'STUDENT');

INSERT INTO `subscription_plan` (`name`, `price`, `duration_days`, `features`) VALUES 
('Monthly Pro', 9.99, 30, '["AI_TUTOR", "UNLIMITED_PRACTICE"]'),
('Annual Pro', 99.00, 365, '["AI_TUTOR", "UNLIMITED_PRACTICE", "OFFLINE_DOWNLOAD"]');

SET FOREIGN_KEY_CHECKS = 1;
